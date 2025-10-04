import AWS from "aws-sdk"

const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT,
  region: "us-west-002", 
  accessKeyId: process.env.B2_KEY_ID,
  secretAccessKey: process.env.B2_APP_KEY,
  signatureVersion: "v4"
});

export default s3;