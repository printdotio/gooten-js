PIO.util.di = new PIO.util.Di();

// DOM
PIO.util.di.register("window", [], function() {
    return window;
});

PIO.util.di.register("document", [], function() {
    return document;
});

// Libraries
PIO.util.di.register("ko", [], function() {
    return ko;
});

PIO.util.di.register("$", [], function() {
    return jQuery;
});

PIO.util.di.register("_", [], function() {
    return _;
});

// PIO
PIO.util.di.register("PIO", [], function() {
    return PIO;
});

PIO.util.di.register("PIO.settings", [], function() {
    return PIO.settings;
});

// Editor
PIO.util.di.register("PIO.ui.editorFns", [], function() {
    return PIO.ui.editorFns;
});

// Utilities
PIO.util.di.register("PIO.util", [], function() {
    return PIO.util;
});

PIO.util.di.register("PIO.env", [], function() {
    return PIO.env;
});

PIO.util.di.register("PIO.util.ko.mapUtil", [], function() {
    return PIO.util.ko.mapUtil;
});
