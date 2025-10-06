import AWS from "aws-sdk"
import dotenv from "dotenv"

dotenv.config()
const s3 = new AWS.S3({
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  region: process.env.B2_REGION,
  accessKeyId: process.env.B2_KEY_ID,
  secretAccessKey: process.env.B2_APP_KEY,
  signatureVersion: "v4"
});

export default s3;