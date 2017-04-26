require("file?name=dist/index.html!./index.html");
require("!style!css!./pdfanno.css");

import { enableAnnotateTool, disableAnnotateTools, clearAllAnnotations } from './page/util/anno';
import { resetPDFViewerSettings } from './page/util/display';

import * as browseButton from './page/ui/browseButton';
import * as pdfDropdown from './page/ui/pdfDropdown';
import * as primaryAnnoDropdown from './page/ui/primaryAnnoDropdown';
import * as annoListDropdown from './page/ui/annoListDropdown';
import * as referenceAnnoDropdown from './page/ui/referenceAnnoDropdown';
import * as annotationsTools from './page/ui/annotationTools';
import * as inputLabel from './page/ui/inputLabel';

import {
    displayAnnotation,
    reloadPDFViewer,
    setupColorPicker
} from './page/util/display';

import {
    listenWindowLeaveEvent,
    unlistenWindowLeaveEvent,
    resizeHandler
} from './page/util/window';

import * as publicApi from './page/public';

/**
 * Expose public APIs.
 */
window.add = publicApi.addAnnotation;
window.addAll = publicApi.addAllAnnotations;
window.delete = publicApi.deleteAnnotation;
window.RectAnnotation = publicApi.PublicRectAnnotation;
window.SpanAnnotation = publicApi.PublicSpanAnnotation;
window.RelationAnnotation = publicApi.PublicRelationAnnotation;
window.readTOML = publicApi.readTOML;

/**
 * The data which is loaded via `Browse` button.
 */
window.fileMap = {};

/**
    Adjust the height of viewer according to window height.
*/
function adjustViewerSize() {
    window.removeEventListener('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);
    resizeHandler();
}

/**
 * Start PDFAnno Application.
 */
function startApplication() {

    // Alias for convenience.
    window.iframeWindow = $('#viewer iframe').get(0).contentWindow;

    iframeWindow.addEventListener('DOMContentLoaded', () => {

        // Adjust the height of viewer.
        adjustViewerSize();

        // Reset the confirm dialog at leaving page.
        unlistenWindowLeaveEvent();

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('iframeDOMContentLoaded', true, true, null);
        window.dispatchEvent(event);

    });

    iframeWindow.addEventListener('annotationrendered', () => {

        // Restore the status of AnnoTools.
        disableAnnotateTools();
        enableAnnotateTool(window.currentAnnoToolType);

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('annotationrendered', true, true, null);
        window.dispatchEvent(event);
    });

    // Set the confirm dialog when leaving a page.
    iframeWindow.addEventListener('annotationUpdated', () => {
        listenWindowLeaveEvent();

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('annotationUpdated', true, true, null);
        window.dispatchEvent(event);
    });

    // enable text input.
    iframeWindow.addEventListener('enableTextInput', (e) => {
        console.log('enableTextInput:', e.detail);
        inputLabel.enable(e.detail);
    });

    // disable text input.
    iframeWindow.addEventListener('disappearTextInput', (e) => {
        console.log('disappearTextInput:', e.detail);
        inputLabel.disable(e.detail);
    });
}

/**
 *  The entry point.
 */
window.addEventListener('DOMContentLoaded', e => {

    // Delete prev annotations.
    if (location.search.indexOf('debug') === -1) {
        clearAllAnnotations();
    }

    // Reset PDFViwer settings.
    resetPDFViewerSettings();

    // Start application.
    startApplication();

    // Setup UI parts.
    browseButton.setup();
    pdfDropdown.setup();
    primaryAnnoDropdown.setup();
    referenceAnnoDropdown.setup();
    annoListDropdown.setup();
    annotationsTools.setup();

    window.addEventListener('restartApp', startApplication);
});
