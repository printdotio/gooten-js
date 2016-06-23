GTN.util.di = new GTN.util.Di();

// DOM
GTN.util.di.register("window", [], function() {
    return window;
});

GTN.util.di.register("document", [], function() {
    return document;
});

// Libraries
GTN.util.di.register("ko", [], function() {
    return ko;
});

GTN.util.di.register("$", [], function() {
    return jQuery;
});

GTN.util.di.register("_", [], function() {
    return _;
});

// PIO
GTN.util.di.register("PIO", [], function() {
    return PIO;
});

GTN.util.di.register("GTN.settings", [], function() {
    return GTN.settings;
});

// Editor
GTN.util.di.register("GTN.ui.editorFns", [], function() {
    return GTN.ui.editorFns;
});

// Utilities
GTN.util.di.register("GTN.util", [], function() {
    return GTN.util;
});

GTN.util.di.register("GTN.env", [], function() {
    return GTN.env;
});

GTN.util.di.register("GTN.util.ko.mapUtil", [], function() {
    return GTN.util.ko.mapUtil;
});
