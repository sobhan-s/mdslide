export const presentorWindowCss = `
    <style>
        body {
            margin: 0;
            padding: 15px;
            background: #111;
            color: #eee;
            font-family: system-ui, -apple-system, sans-serif;
            height: 100vh;
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            grid-template-rows: 1.2fr 1fr;
            gap: 15px;
            box-sizing: border-box;
            overflow: hidden;
            align-items: stretch;
            justify-items: stretch;
        }
        .panel {
            border-radius: 10px;
            border: 1px solid #2c2c2e;
            padding: 6px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        .panel-title {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #98989d;
            margin-bottom: 10px;
            font-weight: 700;
            flex-shrink: 0;
        }
        .preview-container {
            flex-grow: 1;
            position: relative;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
        }
        #current-panel {
            grid-row: span 2;
        }
        #current-preview, #next-preview {
            width: 1920px;
            height: 1080px;
            transform-origin: top left;
            background: var(--slide-bg);
            position: absolute;
            top: 0;
            left: 0;
        }
        #notes-panel {
            background: #1c1c1e;
        }
        #notes-content {
            font-size: 1.25rem;
            line-height: 1.6;
            overflow-y: auto;
            color: #eaeaea;
            flex-grow: 1;
            padding-right: 5px;
        }
        .slide {
            position: absolute !important;
            opacity: 1 !important;
            transform: none !important;
            pointer-events: none !important;
            width: 1920px !important;
            height: 1080px !important;
            top: 0 !important;
            left: 0 !important;
        }
        .no-next {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #636366;
            height: 100%;
            font-size: 1.5rem;
            font-weight: 500;
            background: #1c1c1e;
        }
        #notes-content::-webkit-scrollbar {
            width: 6px;
        }
        #notes-content::-webkit-scrollbar-track {
            background: transparent;
        }
        #notes-content::-webkit-scrollbar-thumb {
            background: #3a3a3c;
            border-radius: 3px;
        }
  <\\/style>
`;
