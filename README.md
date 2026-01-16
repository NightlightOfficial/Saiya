# Saiya
Web video player used on Nightlight. Customizable, smooth and modern design.

## Information
Saiya is actively being used on Nightlight, you can help us improve it by submitting issues and/or pull requests!
You can also use Saiya in any of your projects, it's open source! Attribution is appreciated.
## Usage
Using Saiya is simple, you can do so in 2 lines!
```js
<script src="saiya.js"></script>
<script>
    let saiya = new Saiya("https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4");
    document.getElementById('videoPlayerPlacement').appendChild(saiya.create());
</script>
```
Import the Saiya JavaScript and CSS files (as you can see in examples/), initialize the class with a valid video path and finally, use the `Saiya.create()` function which returns the Saiya video player element which you can append to any div container you like.
### Methods
**create()**
- This method creates the video player element and prepars the class. It needs to be used before using any other method.
  
**setType(type)**
- Accepts 0 or 1 for the type of player to use. 0 is the default with the audio bar outside, 1 is with the audio bar inside.
  
**pause()**
- Pauses the video playback

**play()**
- Resumes the video playback if paused, otherwise pauses the playback.

**mute()**
- Mutes the video. This automatically affects the audio bar as well.

**maximize()**
- Maximizes the video using the default browser method or a custom handler by setting the fullscreenHandler property to a function
### Dev Methods
**refresh()**
- Attempts to fix locally cached video by forcing the browser to fetch a fresh source
- It can retry up to 5 times


## Customization
The CSS file contains variables taken from Nightlight's color pallete and are used in all colors on Saiya.
You can change those to affect all elements using that color.

You can also customize what the fullscreen button does, by changing the `fullscreenHandler` property in the initialized class or you can leave it as is to keep Saiya's default fullscreen mode.


Disclaimer: this readme isn't finished 
