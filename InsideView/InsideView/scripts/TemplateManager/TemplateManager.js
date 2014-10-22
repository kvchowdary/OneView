function TemplateManager(options) {
    var defaults = {
        templateUri: null,
        parameters: [],
        texts:null,
        data: null,
        containerElement: null,
        eventHandlers: {
            onRendered: null
        }
    };
    this.options = $.extend(defaults, options);

    this.JsonData = null;
    this.template = null;
    this.templateObject = null;
    
    this.ready = false;
    this.rendered = false;
    
    if (this.options.templateUri != null)
        this.LoadTemplateFile();
}

/// <summary>
/// Loads a tempalte file (.tpl)
/// The path to the template file is in the options object set when this TemplateManager instance is created
/// </summary>
TemplateManager.prototype.LoadTemplateFile = function () {
    var _this = this;
    $.ajax(
    {
        type: "get",
        url: this.options.templateUri,
        success: function (result) { _this.TemplateLoaded(result); },
        dataType: "text",
        context: this
    });

};
/// <summary>
/// This is the callback when a template file is loaded. 
/// This method will save the template in a local var and if there's data in the options object, it will render the template
/// </summary>
/// <param name="result">The template file contents</param>
/// <returns>return</returns>
TemplateManager.prototype.TemplateLoaded = function (result) {
    this.template = result;
    this.ready = true;
    if (this.options.data != null)
        this.Render();
};
TemplateManager.prototype.throwError = function(errorMessage) {

};
/// <summary>
/// Renders a template. This is the method that should be called by other classes for normal rendering
/// </summary>
/// <param name="data">The data to render the template with</param>
/// <returns>return</returns>
TemplateManager.prototype.Render = function(data, context, retryCount) {
    if (this.template == null) {
        var _this = this;
        retryCount = (typeof retryCount=="undefined" ? 10 : retryCount-1);
        if (retryCount === 0) return;//give up on loading the template
        
        setTimeout(function() { _this.Render(data, context, retryCount); }, 200);
        return;
    }

    //Verify parameters were set
    if (this.options.templateUri == null) { this.throwError('TemplateUri not set'); return; } //Get messages from i18n file
    if (this.options.containerElement == null) { this.throwError('ContainerElement not set'); return; }
    //if (typeof data == "undefined" && this.options.data == null) { this.throwError('no data passed'); return; }

    if (typeof data == "undefined") data = this.options.data;
    if (typeof data == "undefined") data = {};
    this.JsonData = data;
    this.applyTemplate();

    this.rendered = true;

    //Call on rendered callbacks
    if (this.options.eventHandlers.onRendered) this.options.eventHandlers.onRendered(context);
};
/// <summary>
/// Renders the template and inserts the HTML into the container element
/// </summary>
/// <param name="containerElement">The element to insert the HTML into</param>
/// <param name="data">The data to render the template with</param>
/// <returns>return</returns>
TemplateManager.prototype.applyTemplate = function(containerElement, data) {
    this.parseTemplate();
    var html = this.processTemplate(data);

    if (typeof containerElement == "undefined")
        containerElement = this.options.containerElement;

    if (typeof containerElement == "object") {
        containerElement.html(html);
    } else {
        $(containerElement).html(html);
    }
};
/// <summary>
/// parses the template and saves it to templateObject (this is done only thr first time)
/// </summary>
TemplateManager.prototype.parseTemplate = function() {
    if (this.templateObject == null)
        this.templateObject = TrimPath.parseTemplate(this.template, this.options.templateName);
};
TemplateManager.prototype.RenderHtml = function(data) {
    this.parseTemplate();
    return this.processTemplate(data);
};
/// <summary>
/// Processes the template and returns the resulting HTML
/// </summary>
/// <param name="data">The data to pass to the template for rendering</param>
/// <returns>The rendered HTML</returns>
TemplateManager.prototype.processTemplate = function(data) {
    if (typeof data != 'undefined') { this.JsonData = data; }
    renderData = { data: this.JsonData, params: this.options.parameters, texts: this.options.texts };
    renderData._MODIFIERS = this.getModifiers();
    var result = this.templateObject.process(renderData);
    return result;
};
/// <summary>
/// Modifiers that can be used in the template (${data.name|modifiername})
/// </summary>
TemplateManager.prototype.getModifiers = function () {
    return {
        shortDateUS: function (dateObject) {
            //return dateObject.getMonth() + 1 + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();
            return dateObject.format('MM/dd/yyyy');
        },
        longDateUS: function (dateObject) {
            return dateObject.format('MMM ddd, yyyy');
        },
        longDateUSWithOutDaySuffix: function (dateObject) {
            return dateObject.format('MMM dd, yyyy');
        },
        shortDateUSWithOutDaySuffix: function (dateObject) {
            return dateObject.format('dd NNN, yyyy');
        },
        shortDateTimeUS: function (dateObject) {
            return dateObject.format('MM/dd/yyyy h:mm:ss a');
        },
        numberString: function (num) {
            return $.formatNumber(new String(num), { format: "#,###" });
        },
        percentageString: function (num) {
            return $.formatNumber(new String(num), { format: "##.00%" });
        },
        truncate: function (str, length, dots) {
            if (!length) length = 32;
            if (str == null) return str;
            if (str.length <= length) return str;
            if (!dots) return str.toString().substring(0, length);
            return str.toString().substring(0, length - dots.length) + dots;
        },
        removeMid: function (str, length, removeLength, dots) {
            if (!length) length = 32;
            if (!removeLength) removeLength = 5;
            if (!dots) dots = '...';
            if (str.length <= length) return str;
            str = str.toString();
            return str.substring(0, length - removeLength - dots.length) + dots + str.substring(str.length - removeLength);
        },

        financial: function (num) {
            if (num >= 0)
                return $.formatNumber(new String(num), { format: '#,###.00' });
            else
                return $.formatNumber(new String(num), { format: '(#,###.00)' });
        },
        currency: function (num) {
            return $.formatNumber(new String(num), { format: '$ #,###.00' });
        },

        getOriginalFileName: function (str) {
            str = decodeURIComponent(str);
            if (str.indexOf('+') > 0) {
                return str.split('+')[1];
            } else {
                var pos = str.lastIndexOf("__");
                if (pos > 0)
                    return str.substring(pos + 2);
            }
            return str;
        },

        url: function (str) {
            return encodeURIComponent(str);
        },

        round: function (num, places) {
            return num.toFixed(places);
        },

        removeSplChars: function (str) {
            return str.replace(/[\/\+\'\"]/gi, "")
                       .replace(/([^\w\d\-])+(?=\w|$)/gi, "-")
                       .replace(/^[^\w\d]|([^\w\d]$)/gi, "")
                       .toLowerCase();
        },

        summayList: function (list, noOfItemsToDisplay) {
            var displayText = "";
            $.each(list, function (i, v) {
                if (i < noOfItemsToDisplay)
                    displayText = displayText + this.name + ',';
            });
            return displayText;
        }
    };
};

