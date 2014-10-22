AGS.Views.Help = function (options) {
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
        templateName: 'Help',
        templateUri: 'js/views/help/help.html',
        parameters: [],
        containerElement: this.options.containerSelector,
        eventHandlers: { onRendered: function () { _this.onRendered(); } }
    });
};

AGS.Views.Help.prototype = {
    setData: function (data) {
        this.tm.Render(data, this);
    },
    /******************************************************************************************
    Event handling
    ******************************************************************************************/
    onRendered: function () {
        if (this.options.eventHandlers.rendered)
            this.options.eventHandlers.rendered();
    }
};