import { presentorWindowCss } from '../../themes/presentorWindowCss.js';
import { presentorWindowScript } from './presentorWIndowScript.js';

export const presentorWindow = `

<!DOCTYPE html>
<html>
<head>
  <title>Presenter View - MdSlide</title>
  \${styles}
  ${presentorWindowCss}
<\\/head>
<body>
  <div class="panel" id="current-panel">
    <div class="panel-title">Current Slide</div>
    <div class="preview-container">
      <div id="current-preview"></div>
    </div>
  </div>
  <div class="panel" id="next-panel">
    <div class="panel-title">Next Slide</div>
    <div class="preview-container">
      <div id="next-preview"></div>
    </div>
  </div>
  <div class="panel" id="notes-panel">
    <div class="panel-title">Speaker Notes</div>
    <div id="notes-content"></div>
  </div>

  <script>
    ${presentorWindowScript}
  <\\/script>
<\\/body>
<\\/html>

`;
