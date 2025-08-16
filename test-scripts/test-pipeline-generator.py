#!/usr/bin/env python3
"""
Test script for the GStreamer Pipeline Generator
This script tests the Lambda function and Bedrock agent integration
"""

import json
import boto3
import requests
import argparse
import sys
from typing import Dict, Any

def test_lambda_direct(function_name: str, rtsp_url: str, region: str = 'us-east-1') -> Dict[str, Any]:
    """
    Test the Lambda function directly using boto3
    """
    lambda_client = boto3.client('lambda', region_name=region)
    
    payload = {
        'rtsp_url': rtsp_url
    }
    
    try:
        response = lambda_client.invoke(
            FunctionName=function_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )
        
        result = json.loads(response['Payload'].read())
        return result
        
    except Exception as e:
        return {'error': str(e)}

def test_api_gateway(api_url: str, rtsp_url: str) -> Dict[str, Any]:
    """
    Test the API Gateway endpoint
    """
    payload = {
        'rtsp_url': rtsp_url
    }
    
    try:
        response = requests.post(
            api_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=300  # 5 minutes timeout
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                'error': f'HTTP {response.status_code}',
                'message': response.text
            }
            
    except Exception as e:
        return {'error': str(e)}

def test_bedrock_agent_direct(agent_id: str, agent_alias_id: str, stream_analysis: str, region: str = 'us-east-1') -> str:
    """
    Test the Bedrock agent directly
    """
    bedrock_client = boto3.client('bedrock-agent-runtime', region_name=region)
    
    prompt = f"""
Please analyze the following RTSP stream information and generate an appropriate GStreamer pipeline for ingesting this stream into Amazon Kinesis Video Streams.

Stream Analysis:
{stream_analysis}

Please provide a complete GStreamer pipeline configuration that:
1. Handles the detected codecs appropriately
2. Includes proper decoder selection based on the stream format
3. Configures appropriate encoder settings for Kinesis Video Streams
4. Handles both video and audio streams if present
5. Includes error handling and buffering as needed

Return the response in JSON format with the pipeline string and explanation.
"""

    try:
        response = bedrock_client.invoke_agent(
            agentId=agent_id,
            agentAliasId=agent_alias_id,
            sessionId=f"test-session-{hash(stream_analysis) % 10000}",
            inputText=prompt
        )
        
        response_text = ""
        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    response_text += chunk['bytes'].decode('utf-8')
        
        return response_text
        
    except Exception as e:
        return f"Error: {str(e)}"

def print_results(result: Dict[str, Any]):
    """
    Pretty print the results
    """
    print("\n" + "="*80)
    print("PIPELINE GENERATION RESULTS")
    print("="*80)
    
    if 'error' in result:
        print(f"❌ ERROR: {result['error']}")
        return
    
    print(f"✅ SUCCESS")
    print(f"📹 RTSP URL: {result.get('rtsp_url', 'N/A')}")
    
    # Print stream analysis summary
    if 'stream_analysis' in result:
        analysis = result['stream_analysis']
        if 'summary' in analysis:
            summary = analysis['summary']
            print(f"\n📊 STREAM SUMMARY:")
            print(f"   Video Streams: {summary.get('video_streams', 0)}")
            print(f"   Audio Streams: {summary.get('audio_streams', 0)}")
            print(f"   Video Codecs: {', '.join(summary.get('video_codecs', []))}")
            print(f"   Audio Codecs: {', '.join(summary.get('audio_codecs', []))}")
            print(f"   Resolutions: {', '.join(summary.get('resolutions', []))}")
    
    # Print generated pipeline
    if 'generated_pipeline' in result:
        print(f"\n🔧 GENERATED PIPELINE:")
        print("-" * 40)
        
        try:
            # Try to parse as JSON
            pipeline_data = json.loads(result['generated_pipeline'])
            if isinstance(pipeline_data, dict) and 'pipeline' in pipeline_data:
                print(f"Pipeline: {pipeline_data['pipeline']}")
                
                if 'explanation' in pipeline_data:
                    exp = pipeline_data['explanation']
                    print(f"\nExplanation:")
                    print(f"  Video: {exp.get('video_handling', 'N/A')}")
                    print(f"  Audio: {exp.get('audio_handling', 'N/A')}")
                    
                    if 'optimizations' in exp:
                        print(f"  Optimizations: {', '.join(exp['optimizations'])}")
                
                if 'alternative_pipelines' in pipeline_data:
                    print(f"\nAlternatives:")
                    for alt in pipeline_data['alternative_pipelines']:
                        print(f"  - {alt.get('name', 'Alternative')}: {alt.get('pipeline', 'N/A')}")
            else:
                print(result['generated_pipeline'])
        except json.JSONDecodeError:
            print(result['generated_pipeline'])

def main():
    parser = argparse.ArgumentParser(description='Test GStreamer Pipeline Generator')
    parser.add_argument('--rtsp-url', required=True, help='RTSP stream URL to analyze')
    parser.add_argument('--test-type', choices=['lambda', 'api', 'agent'], default='lambda',
                       help='Type of test to run')
    parser.add_argument('--function-name', help='Lambda function name (for lambda test)')
    parser.add_argument('--api-url', help='API Gateway URL (for api test)')
    parser.add_argument('--agent-id', help='Bedrock agent ID (for agent test)')
    parser.add_argument('--agent-alias-id', default='TSTALIASID', help='Bedrock agent alias ID')
    parser.add_argument('--region', default='us-east-1', help='AWS region')
    
    args = parser.parse_args()
    
    print(f"🚀 Testing GStreamer Pipeline Generator")
    print(f"📹 RTSP URL: {args.rtsp_url}")
    print(f"🔧 Test Type: {args.test_type}")
    
    if args.test_type == 'lambda':
        if not args.function_name:
            print("❌ ERROR: --function-name is required for lambda test")
            sys.exit(1)
        
        result = test_lambda_direct(args.function_name, args.rtsp_url, args.region)
        print_results(result)
        
    elif args.test_type == 'api':
        if not args.api_url:
            print("❌ ERROR: --api-url is required for api test")
            sys.exit(1)
        
        result = test_api_gateway(args.api_url, args.rtsp_url)
        print_results(result)
        
    elif args.test_type == 'agent':
        if not args.agent_id:
            print("❌ ERROR: --agent-id is required for agent test")
            sys.exit(1)
        
        # For agent test, we need some sample stream analysis
        sample_analysis = json.dumps({
            "rtsp_analysis": {
                "format_info": {
                    "format_name": "rtsp",
                    "duration": "N/A"
                },
                "streams": [
                    {
                        "codec_type": "video",
                        "codec_name": "h264",
                        "width": 1920,
                        "height": 1080,
                        "bit_rate": "2000000"
                    }
                ]
            },
            "summary": {
                "video_streams": 1,
                "audio_streams": 0,
                "video_codecs": ["h264"],
                "audio_codecs": [],
                "resolutions": ["1920x1080"],
                "bitrates": ["2000000"]
            }
        }, indent=2)
        
        result = test_bedrock_agent_direct(args.agent_id, args.agent_alias_id, sample_analysis, args.region)
        print("\n🤖 BEDROCK AGENT RESPONSE:")
        print("-" * 40)
        print(result)

if __name__ == '__main__':
    main()
