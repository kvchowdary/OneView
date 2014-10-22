AGS.Views.AEDList = function (options) {
    var defaults = {
        containerSelector: null,
        eventHandlers: {
            rendered: function () { }
        }
    };
    this.options = $.extend(defaults, options);
    var _this = this;
    this.data = null;

    this.tm = new TemplateManager({
        templateName: 'AEDList',
        templateUri: 'js/views/aedListing/aedListing.html',
        parameters: [],
        containerElement: this.options.containerSelector,
        eventHandlers: { onRendered: function () { _this.onRendered(); } }
    });
};
AGS.Views.AEDList.prototype = {
    setData: function (data) {
        this.tm.Render(data, this);
    },
    /******************************************************************************************
    Event handling
    ******************************************************************************************/
    onRendered: function () {
        if (this.options.eventHandlers.rendered)
            this.options.eventHandlers.rendered();
    },
    reset: function () {
    }
};