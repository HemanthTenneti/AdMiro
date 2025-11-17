import AWS from "aws-sdk";

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${Date.now()}-${fileName}`,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: "public-read",
    };

    const result = await s3.upload(params).promise();
    return result.Location; // Returns the public URL
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract the key from the URL
    const urlParts = fileUrl.split("/");
    const key = urlParts.slice(-1)[0];

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error("Failed to delete file from S3");
  }
};

export default s3;
