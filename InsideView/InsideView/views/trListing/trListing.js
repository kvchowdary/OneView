AGS.Views.TRList = function (options) {
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
        templateName: 'TRList',
        templateUri: 'js/views/trListing/trListing.html',
        parameters: [],
        containerElement: this.options.containerSelector,
        eventHandlers: { onRendered: function () { _this.onRendered(); } }
    });
};

AGS.Views.TRList.prototype = {
    setData: function (data) {
        this.data = data;
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