import AWS from 'aws-sdk';
AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

export const uploadToS3 = async (buffer: Buffer, key: string, contentType: string) => {
  const params = { Bucket: process.env.AWS_S3_BUCKET!, Key: key, Body: buffer, ContentType: contentType };
  const res = await s3.upload(params).promise();
  return res.Location;
};

export const sendEmail = async (to: string, subject: string, body: string) => {
  const params = {
    Source: process.env.AWS_SES_FROM!,
    Destination: { ToAddresses: [to] },
    Message: { Subject: { Data: subject }, Body: { Text: { Data: body } } }
  };
  return ses.sendEmail(params).promise();
};
