import { IAMClient } from "@aws-sdk/client-iam";

console.log(process.env.AWS_ACCESS_KEY_ID);
console.log(process.env.AWS_SECRET_ACCESS_KEY);
console.log(process.env.AWS_REGION);

const iamClient = new IAMClient({

    region: process.env.AWS_REGION,

    credentials: {

        accessKeyId: process.env.AWS_ACCESS_KEY_ID,

        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY

    }

});

export default iamClient;