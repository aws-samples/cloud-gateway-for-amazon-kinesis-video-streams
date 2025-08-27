#!/usr/bin/env python3
"""
Migration script to convert existing camera records to use composite key structure.
This script should be run after deploying the new DynamoDB schema.
"""

import boto3
import json
import sys
from typing import List, Dict, Any
from botocore.exceptions import ClientError

def migrate_cameras():
    """
    Migrate existing camera records from camera_id primary key to composite_key primary key.
    """
    
    # Initialize DynamoDB client
    dynamodb = boto3.resource('dynamodb')
    table_name = 'CameraConfigurations'
    
    try:
        table = dynamodb.Table(table_name)
        print(f"📋 Connected to DynamoDB table: {table_name}")
    except Exception as e:
        print(f"❌ Error connecting to DynamoDB table: {e}")
        return False
    
    try:
        # Scan the table to get all existing records
        print("🔍 Scanning for existing camera records...")
        response = table.scan()
        items = response.get('Items', [])
        
        if not items:
            print("✅ No existing camera records found. Migration not needed.")
            return True
        
        print(f"📊 Found {len(items)} camera records to migrate")
        
        migrated_count = 0
        error_count = 0
        
        for item in items:
            try:
                # Check if this record already has a composite_key (already migrated)
                if 'composite_key' in item:
                    print(f"⏭️  Skipping already migrated camera: {item.get('camera_name', 'Unknown')}")
                    continue
                
                # Extract required fields
                camera_id = item.get('camera_id')
                owner = item.get('owner')
                
                if not camera_id:
                    print(f"⚠️  Skipping record without camera_id: {item}")
                    error_count += 1
                    continue
                
                if not owner:
                    print(f"⚠️  Skipping record without owner: {camera_id}")
                    error_count += 1
                    continue
                
                # Create composite key
                composite_key = f"{camera_id}#{owner}"
                
                # Create new record with composite key
                new_item = item.copy()
                new_item['composite_key'] = composite_key
                
                # Put the new record
                table.put_item(Item=new_item)
                
                # Delete the old record (only if the new one was created successfully)
                table.delete_item(Key={'camera_id': camera_id})
                
                print(f"✅ Migrated camera: {item.get('camera_name', camera_id)} (Owner: {owner})")
                migrated_count += 1
                
            except Exception as e:
                print(f"❌ Error migrating camera {item.get('camera_id', 'Unknown')}: {e}")
                error_count += 1
                continue
        
        print(f"\n📊 Migration Summary:")
        print(f"✅ Successfully migrated: {migrated_count} cameras")
        print(f"❌ Errors: {error_count} cameras")
        
        if error_count == 0:
            print("🎉 Migration completed successfully!")
            return True
        else:
            print("⚠️  Migration completed with some errors. Please review the logs above.")
            return False
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        return False

def verify_migration():
    """
    Verify that the migration was successful by checking the table structure.
    """
    dynamodb = boto3.resource('dynamodb')
    table_name = 'CameraConfigurations'
    
    try:
        table = dynamodb.Table(table_name)
        
        # Scan the table to check records
        response = table.scan()
        items = response.get('Items', [])
        
        print(f"\n🔍 Verification: Found {len(items)} records in the table")
        
        composite_key_count = 0
        old_format_count = 0
        
        for item in items:
            if 'composite_key' in item:
                composite_key_count += 1
            else:
                old_format_count += 1
                print(f"⚠️  Found record without composite_key: {item.get('camera_id', 'Unknown')}")
        
        print(f"✅ Records with composite_key: {composite_key_count}")
        print(f"❌ Records with old format: {old_format_count}")
        
        if old_format_count == 0:
            print("🎉 All records have been successfully migrated!")
            return True
        else:
            print("⚠️  Some records still use the old format. Migration may need to be re-run.")
            return False
            
    except Exception as e:
        print(f"❌ Error during verification: {e}")
        return False

def main():
    """
    Main function to run the migration.
    """
    print("🚀 Camera Records Migration Script")
    print("==================================")
    print("This script migrates existing camera records to use composite key structure.")
    print("Format: camera_id -> composite_key (camera_id#owner_id)")
    print("")
    
    # Ask for confirmation
    response = input("Do you want to proceed with the migration? (y/N): ")
    if response.lower() not in ['y', 'yes']:
        print("❌ Migration cancelled by user.")
        return
    
    # Run migration
    success = migrate_cameras()
    
    if success:
        # Verify migration
        print("\n🔍 Verifying migration...")
        verify_migration()
    
    print("\n✅ Migration script completed.")

if __name__ == "__main__":
    main()
