import express from "express";
import axios from "axios";

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
  if (fileUrl.endsWith(".pdf") || fileUrl.includes(".pdf?")) {
    console.log("PDF link detected");
    // No conversion needed for direct PDF links
  }





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
      filename = "google-drive-file";
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