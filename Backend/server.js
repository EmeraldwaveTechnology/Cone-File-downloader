import express from "express";
import axios from "axios";
import ytdl from "ytdl-core";

const app = express();
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Endpoint to handle file download requests
app.get("/download", async (req, res) => {
  // You will handle the download logic here
  let fileUrl = req.query.url;


  //-----------------------------------------------
  // Validate the URL
  if (!fileUrl) {
    return res.status(400).send("No file URL provided.");
  }

  // _____________________________________________________

  // SUPPORTED LINKS

  // Check if the URL is a Google Docs link
  if (fileUrl.includes("docs.google.com")) {
    console.log("Google Docs link detected");
    // convert to direct download link
    fileUrl = fileUrl.replace(/\/edit.*$/, "/export?format=docx");
  }
  // Check if the URL is a PDF  
  else if (fileUrl.endsWith(".pdf") || fileUrl.includes(".pdf?")) {
    console.log("PDF link detected");
  //   // No conversion needed for direct PDF links
  }

  // Check if the URL is a Google Drive link
  else if (fileUrl.includes("drive.google.com")) {
    // Detect if it's a Google Drive link and convert to direct download link
    console.log("Google Drive link detected");
    
    // Extract the file ID from the Google Drive URL
    const parts = fileUrl.split("/d/");
    const fileId = parts[1].split("/")[0]; 

    // Convert to direct download link
    fileUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

    // peek the content type of the file to determine the extension
    const headResponse = await axios( {
      method: "head",
      url: fileUrl,
    });
    const contentType = headResponse.headers["content-type"];
    console.log("Content-Type:", contentType);

    // Decide file extension based on content type
    let filename = "drive-file";
    if (contentType.includes("pdf")) filename += ".pdf";
      else if (contentType.includes("msword") || contentType.includes("officedocument.wordprocessingml"))  filename += ".docx";
      else if (contentType.includes("video")) filename += ".mp4";
      else if (contentType.includes("image")) filename += ".jpg";
      else if (contentType.includes("audio")) filename += ".mp3";
      else if (contentType.includes("zip") || contentType.includes("compressed")) filename += ".zip";
      else if (contentType.includes("excel") || contentType.includes("officedocument.spreadsheetml")) filename += ".xlsx";
      else if (contentType.includes("powerpoint") || contentType.includes("officedocument.presentationml")) filename += ".pptx";
      // else if (contentType.includes("text")) filename += ".txt";
      else if (contentType.includes("text/html")) return res.status(400).send("Cannot download private Google Drive files. Please ensure the file is shared publicly.");
      else if (contentType.include("folder")) return res.status(400).send("Downloading folders is not supported yet.");
      else filename += ".bin";
  }

  //  Check if the URL is a YouTube link

  // --------------------------------------------------------------


  // start the download process
  console.log(`📥Downloading : ${fileUrl}`);

    //fetch the file from the provided URL and pipe it to the response
  try {
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "stream",
    });

    //  Give Clean filename
    let filename = "downloaded-file";
    // google docs file
    if (fileUrl.includes("docs.google.com")) {
      filename = "document.docx";
    } else if (fileUrl.includes("drive.google.com")) {
      filename = "file";
    }
    // Set headers to trigger download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    // Set the content type based on the response from the original request
    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "application/octet-stream",
    );

    // Pipe the file stream to the response
    response.data.pipe(res);

    // console log when download is complete
    response.data.on("end", () => {
      console.log("✅ Download complete");
    });

    // Handle errors during the download
    response.data.on("error", (err) => {
      console.error("❌ Stream error:", err.message);
    });
  } catch (error) {
    res.status(500).send("Error downloading file.");
  }

});