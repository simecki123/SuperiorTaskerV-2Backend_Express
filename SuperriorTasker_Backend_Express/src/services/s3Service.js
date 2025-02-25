// src/services/s3Service.js
const { 
    HeadObjectCommand, 
    DeleteObjectCommand, 
    PutObjectCommand,
    GetObjectCommand 
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, bucketName } = require('../config/s3Config');

class S3Service {
    async updateFileInS3(path, fileName, fileBuffer) {
        const fullPath = `${path}/${fileName}`;
        
        try {
            // Check if file exists and delete it
            try {
                const headCommand = new HeadObjectCommand({
                    Bucket: bucketName,
                    Key: fullPath
                });
                await s3Client.send(headCommand);

                // If file exists, delete it
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: fullPath
                });
                await s3Client.send(deleteCommand);
                
                console.log('Existing file deleted successfully');
            } catch (error) {
                if (error.name !== 'NotFound') {
                    throw error;
                }
            }

            // Upload new file
            const putCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: fullPath,
                Body: fileBuffer
            });
            await s3Client.send(putCommand);

            console.log('New file uploaded successfully');
            return fullPath;
        } catch (error) {
            console.error('Error occurred while updating file in S3', error);
            throw new Error('Failed to update file in S3');
        }
    }

    async generatePresignedUrl(fileUri) {
        if (!fileUri) return null;

        try {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: fileUri
            });

            const url = await getSignedUrl(s3Client, command, {
                expiresIn: 3600 // URL expires in 1 hour
            });

            return url;
        } catch (error) {
            console.error('Error generating presigned URL:', error);
            return null;
        }
    }

    // Helper method to get photo URL (used by services)
    async getPhotoUrl(photoUri) {
        if (!photoUri) return null;
        return this.generatePresignedUrl(photoUri);
    }
}

module.exports = new S3Service();