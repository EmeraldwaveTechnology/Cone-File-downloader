// Endpoint to handle file download requests
app.get("/download", async (req, res) => {
  // You will handle the download logic here
  let fileUrl = req.query.url;

  // Validate the URL
  if (!fileUrl) {
    return res.status(400).send("No file URL provided.");
  }

  // Check type of fileUrl

  // Check if the URL is a Google Docs link
  if (fileUrl.includes("docs.google.com")) {
    return res;
    // .status(400)
    // .send("Downloading from Google Docs is not supported yet.");

    // convert to direct download link
    fileUrl = fileUrl.replace(/\/edit.*$/, "/export?format=pdf");
  }

  // if (fileUrl.includes("export?format=pdf"))
  //    {
  //   return res
  //   .status(200)
  //   .send("now converted to direct download link.");
  // }
  // return res
  // .status(400)
  // .send("unable to convert");
  // });

  // Check if the URL is a Google Drive link
  if (fileUrl.includes("drive.google.com")) {
    // convert to direct download link
    fileUrl = fileUrl.replace(
      /\/file\/d\/(.*?)(\/|$)/,
      "/uc?id=$1&export=download",
    );
  }

  // NOT SUPPORTED YET
  // Check if the link is youtube link
  if (
    fileUrl.includes("youtube.com") ||
    fileUrl.includes("youtu.be") ||
    fileUrl.includes("m.youtube.com")
  ) {
    return res
      .status(400)
      .send("Downloading from YouTube is not supported yet.");
  } //facebook video link
  else if (fileUrl.includes("facebook.com")) {
    return res
      .status(400)
      .send("Downloading from Facebook is not supported yet.");
  } //Tiktok video link
  else if (fileUrl.includes("tiktok.com")) {
    return res
      .status(400)
      .send("Downloading from TikTok is not supported yet.");
  } //google drive folder link
  else if (fileUrl.includes("drive.google.com/folder")) {
    return res
      .status(400)
      .send("Downloading from Google Drive folders is not supported yet.");
  } else {
    return res.status(400).send("This URL is not supported yet.");
  }

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
      filename = "google-doc.pdf";
    } else if (fileUrl.includes("drive.google.com")) {
      filename = "google-drive-file";
    }

    // Set headers to prompt download
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
