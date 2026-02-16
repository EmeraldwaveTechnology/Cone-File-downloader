import ytdl from "ytdl-core";

const url =  "https://www.youtube.com/watch?v=Ia47wPj0Z7o"

  async function test() {
    try {
      const info = await ytdl.getInfo(url);
      console.log("Title:", info.videoDetails.title);
    } catch (error) {
      console.error("Error fetching video info:", error.message);
    }
  }

  test();