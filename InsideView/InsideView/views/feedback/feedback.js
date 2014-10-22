AGS.Views.Feedback = function (options) {
    var defaults = {
        containerSelector: null,
        eventHandlers: {
            rendered: function () { },
            onFeedbackSent : null,
            onSendClicked : null
        }
    };
    this.options = $.extend(defaults, options);
    var _this = this;
    this.data = null;

    this.tm = new TemplateManager({
        templateName: 'Feedback',
        templateUri: 'js/views/feedback/feedback.html',
        parameters: [],
        containerElement: this.options.containerSelector,
        eventHandlers: { onRendered: function () { _this.onRendered(); } }
    });
};

AGS.Views.Feedback.prototype = {
    setData: function (data) {
        this.data = data;
        this.tm.Render(data, this);
    },


    /******************************************************************************************
    Event handling
    ******************************************************************************************/
    onRendered: function () {
        this.attachEvents();
        if (this.options.eventHandlers.rendered)
            this.options.eventHandlers.rendered();
    },
    attachEvents: function () {
        var container = $(this.options.containerSelector);
        var _this = this;
        container.find("#btnSend").click(function () {
            _this.sendClicked();
        });
    },
    sendClicked: function () {
        var msg = $.trim($(this.options.containerSelector).find("#txtFeedback").val());
        if (msg != null && msg.length > 0) {
            this.options.eventHandlers.onSendClicked(msg);
        } else {
            alert("Please enter your feedback", null, "Feedback", "OK");
        }

    },
    reset: function () {
        $(this.options.containerSelector).find("#txtFeedback").val("");
    }
};