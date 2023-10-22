const aws = require("aws-sdk");
const sharp = require("sharp");
const s3 = new aws.S3();

exports.handler = async function (event, context) {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));
  if(event.Records[0].eventName === "ObjectRemoved:Delete") {
    return;
  }
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  console.log(`Bucket: ${bucket}`, `Key: ${key}`);
  
  
  var ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
 
  
  if (ext.indexOf("png") >= 0 || ext.indexOf("jpg") >= 0 ||ext.indexOf("jpeg") >= 0)
  {
	  console.log("File IS ALLOWED to RESIZED");
  }
  else
  {
	  console.log("File NOT ALLOWED to RESIZED");
	  return "File NOT ALLOWED to RESIZED" 
  }
  
  if (key.indexOf("1080") >= 0 || key.indexOf("720") >= 0 || key.indexOf("480") >= 0
   || key.indexOf("240") >= 0 || key.indexOf("144") >= 0){
	   
	  console.log("RESIZED NOT ALLOWED FOR THIS FOLDER");
	 return "RESIZED NOT ALLOWED" 
  }
  
 
	  
  try {
    // get image from s3
    let tempimage = await s3.getObject({ Bucket: bucket, Key: key}).promise();

    // resize image
    let image = await sharp(tempimage.Body);
    const metadata = await image.metadata();
    if(metadata.width > 0) {
		
	  const foldername = key.substring(0,key.lastIndexOf("/")+1);
	  const filename = key.replace(/^.*[\\\/]/, '')
	  
	  console.log(`filename: ${filename}`, `foldername: ${foldername}`);
		
      const resized1080Image = await image.resize({ height: 1080 }).withMetadata().toBuffer();
      var key1080 = foldername +"1080/"+filename
      await s3.putObject({ Bucket: bucket, Key: key1080, Body: resized1080Image, ContentType: 'image/jpeg' }).promise();

	  const resized720Image = await image.resize({ height: 720 }).withMetadata().toBuffer();
	  var key720 = foldername +"720/"+filename
	  await s3.putObject({ Bucket: bucket, Key: key720, Body: resized720Image, ContentType: 'image/jpeg' }).promise();
	  
	  const resized480Image = await image.resize({ height: 480 }).withMetadata().toBuffer();
	  var key480 = foldername +"480/"+filename
	  await s3.putObject({ Bucket: bucket, Key: key480, Body: resized480Image, ContentType: 'image/jpeg' }).promise();
	  
	  const resized240Image = await image.resize({ height: 240 }).withMetadata().toBuffer();
	  var key240 = foldername +"240/"+filename
	  await s3.putObject({ Bucket: bucket, Key: key240, Body: resized240Image, ContentType: 'image/jpeg' }).promise();
	  
	  const resized144Image = await image.resize({ height: 144 }).withMetadata().toBuffer();
	  var key144 = foldername +"144/"+filename
	  await s3.putObject({ Bucket: bucket, Key: key144, Body: resized144Image, ContentType: 'image/jpeg' }).promise();
	  
	  // store image
      console.log("RESIZED IMAGE");
      return "RESIZED IMAGE"
    } else {
      console.log("NOT RESIZED IMAGE")
      return "NOT RESIZED IMAGE"
    }
  } catch (err) {
    context.fail(`Error resizing image: ${err}`);
  }

};
