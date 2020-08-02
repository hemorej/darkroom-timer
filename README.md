The Darkroom Timer
==============

A timer for film development

A quick personal tool I made over a weekend to help me time film development at home. You can find the running app [here](https://jerome-arfouche.com/darkroom).


### notes
- To run the app in development, first run `npm install`, then `npm run serve`  
- For production, run `npm run build`, and upload `/dist` to your server  
- `app.css` and `foundation.css` under `/dist` need minifying before uploading to production  
- Make sure `index.html` and `.htaccess` are not routing from subdirectory `/darkroom`
- You can use `space` to pause/resume while the timer is running, `esc` to reset the timer, `f` to fullscreen the timer
