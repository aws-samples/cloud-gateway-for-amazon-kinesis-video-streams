import json
import uuid
import boto3
import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import logging
from botocore.exceptions import ClientError
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
secrets_client = boto3.client('secretsmanager')

# Environment variables
CAMERAS_TABLE_NAME = os.environ['CAMERAS_TABLE_NAME']
CAMERAS_TABLE_CAMERA_ID_GSI_NAME = os.environ['CAMERAS_TABLE_CAMERA_ID_GSI_NAME']
CAMERAS_TABLE_OWNER_GSI_NAME = os.environ['CAMERAS_TABLE_OWNER_GSI_NAME']
SECRETS_PREFIX = os.environ['SECRETS_PREFIX']

# Get DynamoDB table
cameras_table = dynamodb.Table(CAMERAS_TABLE_NAME)

def convert_floats_to_decimal(obj):
    """
    Recursively convert float values to Decimal for DynamoDB compatibility.
    DynamoDB doesn't support Python float types - they must be Decimal.
    """
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {key: convert_floats_to_decimal(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats_to_decimal(item) for item in obj]
    else:
        return obj

def create_composite_key(camera_id: str, owner_id: str) -> str:
    """
    Create a composite key from camera_id and owner_id.
    Format: {camera_id}#{owner_id}
    """
    return f"{camera_id}#{owner_id}"

def parse_composite_key(composite_key: str) -> tuple[str, str]:
    """
    Parse a composite key to extract camera_id and owner_id.
    Returns: (camera_id, owner_id)
    """
    parts = composite_key.split('#', 1)
    if len(parts) != 2:
        raise ValueError(f"Invalid composite key format: {composite_key}")
    return parts[0], parts[1]

def get_user_identity(event: Dict[str, Any]) -> Optional[str]:
    """
    Extract user identity from the API Gateway event context.
    Supports multiple authentication methods (Cognito User Pool, Identity Pool, etc.)
    """
    try:
        request_context = event.get('requestContext', {})
        
        # Try Cognito User Pool authorizer claims first
        authorizer = request_context.get('authorizer', {})
        if isinstance(authorizer, dict):
            claims = authorizer.get('claims', {})
            if isinstance(claims, dict):
                # Try 'sub' (subject) first - most reliable unique identifier
                user_id = claims.get('sub')
                if user_id:
                    logger.info(f"Found user ID from Cognito sub: {user_id}")
                    return user_id
                
                # Fallback to username
                username = claims.get('username') or claims.get('cognito:username')
                if username:
                    logger.info(f"Found user ID from username: {username}")
                    return username
                
                # Fallback to email
                email = claims.get('email')
                if email:
                    logger.info(f"Found user ID from email: {email}")
                    return email
        
        # Try Cognito Identity Pool
        identity = request_context.get('identity', {})
        if isinstance(identity, dict):
            cognito_identity_id = identity.get('cognitoIdentityId')
            if cognito_identity_id:
                logger.info(f"Found user ID from Cognito Identity: {cognito_identity_id}")
                return cognito_identity_id
            
            # Fallback to user ARN
            user_arn = identity.get('userArn')
            if user_arn:
                logger.info(f"Found user ID from ARN: {user_arn}")
                return user_arn
        
        # If no authentication context found, log warning
        logger.warning("No user identity found in request context")
        logger.debug(f"Request context: {json.dumps(request_context, default=str)}")
        return None
        
    except Exception as e:
        logger.error(f"Error extracting user identity: {str(e)}", exc_info=True)
        return None

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for camera management operations.
    Supports CRUD operations for camera configurations with owner-based access control.
    """
    try:
        logger.info(f"Received event: {json.dumps(event, default=str)}")
        
        # Extract user identity from request context
        user_id = get_user_identity(event)
        if not user_id:
            return create_response(401, {'error': 'User authentication required'})
        
        # Extract HTTP method and path
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')
        path_parameters = event.get('pathParameters') or {}
        query_parameters = event.get('queryStringParameters') or {}
        
        # Parse request body if present
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in request body: {e}")
                return create_response(400, {'error': 'Invalid JSON in request body'})
        
        # Route to appropriate handler based on HTTP method and path
        if http_method == 'POST' and path == '/cameras':
            return create_camera(body, user_id)
        elif http_method == 'GET' and path == '/cameras':
            return list_cameras(query_parameters, user_id)
        elif http_method == 'GET' and path.startswith('/cameras/'):
            camera_id = path_parameters.get('camera_id')
            if not camera_id:
                return create_response(400, {'error': 'Camera ID is required'})
            return get_camera(camera_id, user_id)
        elif http_method == 'PUT' and path.startswith('/cameras/'):
            camera_id = path_parameters.get('camera_id')
            if not camera_id:
                return create_response(400, {'error': 'Camera ID is required'})
            return update_camera(camera_id, body, user_id)
        elif http_method == 'DELETE' and path.startswith('/cameras/'):
            camera_id = path_parameters.get('camera_id')
            if not camera_id:
                return create_response(400, {'error': 'Camera ID is required'})
            return delete_camera(camera_id, user_id)
        else:
            return create_response(404, {'error': 'Endpoint not found'})
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Internal server error'})

def create_camera(data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Create a new camera configuration for the authenticated user."""
    try:
        logger.info(f"Creating camera for user: {user_id} with data: {json.dumps(data, default=str)}")
        
        # Validate required fields
        required_fields = ['camera_name', 'rtsp_url', 'make_model', 'installation_location', 'retention_hours', 'ml_model']
        for field in required_fields:
            if field not in data or not data[field]:
                logger.error(f"Missing required field: {field}")
                return create_response(400, {'error': f'Missing required field: {field}'})
        
        # Generate unique camera ID
        camera_id = str(uuid.uuid4())
        logger.info(f"Generated camera ID: {camera_id}")
        
        # Create composite key for DynamoDB primary key
        composite_key = create_composite_key(camera_id, user_id)
        logger.info(f"Created composite key: {composite_key}")
        
        # Extract RTSP URL and store in Secrets Manager
        rtsp_url = data['rtsp_url']
        secret_name = f"{SECRETS_PREFIX}{camera_id}"
        logger.info(f"Creating secret with name: {secret_name}")
        
        try:
            # Create secret in Secrets Manager
            secrets_client.create_secret(
                Name=secret_name,
                Description=f"RTSP URL for camera: {data['camera_name']} (Owner: {user_id})",
                SecretString=rtsp_url,
                Tags=[
                    {'Key': 'CameraId', 'Value': camera_id},
                    {'Key': 'CameraName', 'Value': data['camera_name']},
                    {'Key': 'Owner', 'Value': user_id},
                    {'Key': 'Purpose', 'Value': 'RTSP_URL_STORAGE'}
                ]
            )
            logger.info(f"Successfully created secret: {secret_name} for user: {user_id}")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            logger.error(f"Secrets Manager error: {error_code} - {e.response['Error']['Message']}")
            if error_code == 'ResourceExistsException':
                # Secret already exists, update it
                try:
                    secrets_client.put_secret_value(
                        SecretId=secret_name,
                        SecretString=rtsp_url
                    )
                    logger.info(f"Updated existing secret: {secret_name} for user: {user_id}")
                except ClientError as update_error:
                    logger.error(f"Failed to update existing secret: {update_error}")
                    return create_response(500, {'error': 'Failed to store RTSP credentials securely'})
            else:
                logger.error(f"Failed to create secret: {e}")
                return create_response(500, {'error': 'Failed to store RTSP credentials securely'})
        
        # Store the secret name instead of constructing the full ARN
        # Other AWS services can resolve the secret by name within the same region/account
        region = os.environ.get('AWS_REGION')
        logger.info(f"Using Region: {region}")
        
        # Prepare camera record for DynamoDB
        current_time = datetime.now(timezone.utc).isoformat()
        camera_record = {
            'composite_key': composite_key,  # Primary key: UUID#owner_id
            'camera_id': camera_id,  # Separate field for easy querying
            'owner': user_id,  # Add owner field
            'camera_name': data['camera_name'],
            'make_model': data['make_model'],
            'installation_location': data['installation_location'],
            'retention_hours': int(data['retention_hours']),
            'ml_model': data['ml_model'],
            'rtsp_secret_name': secret_name,  # Store secret name instead of full ARN
            'test_status': data.get('test_status', 'not_tested'),
            'created_at': current_time,
            'updated_at': current_time
        }
        
        # Add optional fields if present
        if 'stream_metadata' in data and data['stream_metadata']:
            camera_record['stream_metadata'] = data['stream_metadata']
        
        if 'screen_capture_base64' in data and data['screen_capture_base64']:
            camera_record['screen_capture_base64'] = data['screen_capture_base64']
        
        logger.info(f"Prepared camera record for DynamoDB: {json.dumps({k: v for k, v in camera_record.items() if k != 'screen_capture_base64'}, default=str)}")
        
        # Convert any float values to Decimal for DynamoDB compatibility
        camera_record = convert_floats_to_decimal(camera_record)
        
        # Save to DynamoDB
        try:
            cameras_table.put_item(Item=camera_record)
            logger.info(f"Successfully saved camera to DynamoDB: {camera_id} for user: {user_id}")
        except Exception as e:
            logger.error(f"Failed to save camera to DynamoDB: {e}")
            # Try to clean up the secret if DynamoDB save failed
            try:
                secrets_client.delete_secret(
                    SecretId=secret_name,
                    ForceDeleteWithoutRecovery=True
                )
                logger.info(f"Cleaned up secret after DynamoDB failure: {secret_name}")
            except Exception as cleanup_error:
                logger.error(f"Failed to cleanup secret after DynamoDB failure: {cleanup_error}")
            return create_response(500, {'error': 'Failed to save camera configuration'})
        
        logger.info(f"Successfully created camera: {camera_id} for user: {user_id}")
        
        # Return response without sensitive data
        response_data = camera_record.copy()
        response_data.pop('screen_capture_base64', None)  # Remove large base64 data from response
        
        return create_response(201, {
            'message': 'Camera created successfully',
            'camera': response_data
        })
        
    except Exception as e:
        logger.error(f"Unexpected error creating camera for user {user_id}: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Failed to create camera'})

def list_cameras(query_params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """List cameras owned by the authenticated user with optional pagination."""
    try:
        # Parse pagination parameters
        limit = query_params.get('limit')
        if limit:
            try:
                limit = int(limit)
                if limit <= 0 or limit > 100:
                    return create_response(400, {'error': 'Limit must be between 1 and 100'})
            except ValueError:
                return create_response(400, {'error': 'Invalid limit parameter'})
        else:
            limit = 20  # Default page size
        
        # Parse pagination token
        last_evaluated_key = query_params.get('next_token')
        if last_evaluated_key:
            try:
                import base64
                last_evaluated_key = json.loads(base64.b64decode(last_evaluated_key).decode('utf-8'))
            except Exception as e:
                logger.warning(f"Invalid pagination token: {e}")
                return create_response(400, {'error': 'Invalid pagination token'})
        
        # Check if frames should be included (optional query parameter)
        include_frames = query_params.get('include_frames', '').lower() == 'true'
        
        # Query cameras by owner using GSI
        query_kwargs = {
            'IndexName': CAMERAS_TABLE_OWNER_GSI_NAME,
            'KeyConditionExpression': '#owner = :owner',
            'ExpressionAttributeNames': {'#owner': 'owner'},
            'ExpressionAttributeValues': {':owner': user_id},
            'ScanIndexForward': False,  # Sort by created_at descending (newest first)
            'Limit': limit
        }
        
        if last_evaluated_key:
            query_kwargs['ExclusiveStartKey'] = last_evaluated_key
        
        response = cameras_table.query(**query_kwargs)
        cameras = response.get('Items', [])
        
        # Remove sensitive data and optionally large fields from response
        for camera in cameras:
            if not include_frames:
                camera.pop('screen_capture_base64', None)
            # Keep rtsp_secret_arn for reference but don't expose the actual URL
        
        # Prepare pagination token for next page
        next_token = None
        if 'LastEvaluatedKey' in response:
            import base64
            next_token = base64.b64encode(
                json.dumps(response['LastEvaluatedKey'], default=str).encode('utf-8')
            ).decode('utf-8')
        
        logger.info(f"Retrieved {len(cameras)} cameras for user: {user_id}")
        
        result = {
            'cameras': cameras,
            'count': len(cameras),
            'owner': user_id
        }
        
        if next_token:
            result['next_token'] = next_token
        
        return create_response(200, result)
        
    except Exception as e:
        logger.error(f"Error listing cameras for user {user_id}: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Failed to list cameras'})

def get_camera(camera_id: str, user_id: str) -> Dict[str, Any]:
    """Get a specific camera by ID, ensuring user owns the camera."""
    try:
        # Create composite key for direct lookup
        composite_key = create_composite_key(camera_id, user_id)
        response = cameras_table.get_item(Key={'composite_key': composite_key})
        
        if 'Item' not in response:
            return create_response(404, {'error': 'Camera not found'})
        
        camera = response['Item']
        
        # Remove large base64 data from response by default
        # Client can request it separately if needed
        camera.pop('screen_capture_base64', None)
        
        logger.info(f"Retrieved camera: {camera_id} for user: {user_id}")
        
        return create_response(200, {'camera': camera})
        
    except Exception as e:
        logger.error(f"Error getting camera {camera_id} for user {user_id}: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Failed to get camera'})

def update_camera(camera_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """Update an existing camera configuration, ensuring user owns the camera."""
    try:
        # Create composite key for direct lookup
        composite_key = create_composite_key(camera_id, user_id)
        
        # First check if camera exists and user owns it
        existing_response = cameras_table.get_item(Key={'composite_key': composite_key})
        if 'Item' not in existing_response:
            return create_response(404, {'error': 'Camera not found'})
        
        existing_camera = existing_response['Item']
        
        # Prepare update expression and values
        update_expression = "SET updated_at = :updated_at"
        expression_values = {':updated_at': datetime.now(timezone.utc).isoformat()}
        
        # Update allowed fields (owner cannot be changed)
        updatable_fields = ['camera_name', 'make_model', 'installation_location', 'retention_hours', 'ml_model', 'stream_metadata', 'screen_capture_base64', 'test_status']
        
        for field in updatable_fields:
            if field in data:
                update_expression += f", {field} = :{field}"
                expression_values[f":{field}"] = data[field]
        
        # Handle RTSP URL update if provided
        if 'rtsp_url' in data:
            secret_name = f"{SECRETS_PREFIX}{camera_id}"
            try:
                secrets_client.put_secret_value(
                    SecretId=secret_name,
                    SecretString=data['rtsp_url']
                )
                logger.info(f"Updated RTSP URL for camera: {camera_id} (user: {user_id})")
            except ClientError as e:
                logger.error(f"Failed to update RTSP URL: {e}")
                return create_response(500, {'error': 'Failed to update RTSP credentials'})
        
        # Convert any float values to Decimal for DynamoDB compatibility
        expression_values = convert_floats_to_decimal(expression_values)
        
        # Update the camera record
        cameras_table.update_item(
            Key={'composite_key': composite_key},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values
        )
        
        # Get updated camera
        updated_response = cameras_table.get_item(Key={'composite_key': composite_key})
        updated_camera = updated_response['Item']
        
        # Remove large base64 data from response
        updated_camera.pop('screen_capture_base64', None)
        
        logger.info(f"Updated camera: {camera_id} for user: {user_id}")
        
        return create_response(200, {
            'message': 'Camera updated successfully',
            'camera': updated_camera
        })
        
    except Exception as e:
        logger.error(f"Error updating camera {camera_id} for user {user_id}: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Failed to update camera'})

def delete_camera(camera_id: str, user_id: str) -> Dict[str, Any]:
    """Delete a camera configuration and its associated secret, ensuring user owns the camera."""
    try:
        # Create composite key for direct lookup
        composite_key = create_composite_key(camera_id, user_id)
        
        # First check if camera exists and user owns it
        existing_response = cameras_table.get_item(Key={'composite_key': composite_key})
        if 'Item' not in existing_response:
            return create_response(404, {'error': 'Camera not found'})
        
        existing_camera = existing_response['Item']
        
        # Delete the secret from Secrets Manager
        secret_name = f"{SECRETS_PREFIX}{camera_id}"
        try:
            secrets_client.delete_secret(
                SecretId=secret_name,
                ForceDeleteWithoutRecovery=True  # Immediate deletion for development
            )
            logger.info(f"Deleted secret: {secret_name} for user: {user_id}")
        except ClientError as e:
            if e.response['Error']['Code'] != 'ResourceNotFoundException':
                logger.warning(f"Failed to delete secret {secret_name}: {e}")
                # Continue with camera deletion even if secret deletion fails
        
        # Delete the camera record
        cameras_table.delete_item(Key={'composite_key': composite_key})
        
        logger.info(f"Deleted camera: {camera_id} for user: {user_id}")
        
        return create_response(200, {'message': 'Camera deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting camera {camera_id} for user {user_id}: {str(e)}", exc_info=True)
        return create_response(500, {'error': 'Failed to delete camera'})

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Create a standardized API Gateway response."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Requested-With'
        },
        'body': json.dumps(body, default=str)
    }
