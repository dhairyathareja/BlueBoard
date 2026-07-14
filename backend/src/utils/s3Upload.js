import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.config.js";

const uploadToS3 = async(file,fileName)=>{

    const command = new PutObjectCommand({

        Bucket:process.env.AWS_BUCKET_NAME,

        Key:fileName,

        Body:file.buffer,

        ContentType:file.mimetype

    });

    await s3Client.send(command);

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

}

export default uploadToS3;