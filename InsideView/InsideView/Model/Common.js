$.ajaxSetup({
    converters: {
        "text json": function (data) {
            //data = jQuery.parseJSON(data);
            if (data.length > 0)
                data = JSON.parse(data, function (k, v) {
                    return (typeof v == "string" && (k = (v.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})\Z$/)) || (v.match(/([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})$/)))) ? new Date(Date.UTC(k[1], k[2] - 1, k[3], k[4], k[5], k[6])) : v;
                });
            return data;
        }
    }
});
AGS.Model.Common = function (options) {
    this.init();
};
AGS.Model.Common.registerErrorCallBack = function (errorCallback) {
    AGS.Model.Common.onServerRequestError = errorCallback;
};
AGS.Model.Common.prototype = {
    ServerUrl: '',
    init: function () {

    },

    ApiRead: function (servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData) {
        if (isOnline) {
            var options = this.getApiOptions(servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData);
            $.Read(options);
        } else {
            $.mobile.loading('hide');
            alert("Please check your device network connection", null, "Network Error", "OK");
        }
    },

    ApiCreate: function (servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData) {
        if (isOnline) {
            var options = this.getApiOptions(servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData);
            $.Create(options);
        } else {
            $.mobile.loading('hide');
            alert("Please check your device network connection", null, "Network Error", "OK");
        }
    },
    ApiUpdate: function (servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData) {
        if (isOnline) {
            var options = this.getApiOptions(servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData);
            $.Update(options);
        } else {
            $.mobile.loading('hide');
            alert("Please check your device network connection", null, "Network Error", "OK");
        }
    },
    ApiDelete: function (servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData) {
        if (isOnline) {
            var options = this.getApiOptions(servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData);
            $.Delete(options);
        } else {
            $.mobile.loading('hide');
            alert("Please check your device network connection", null, "Network Error", "OK");
        }
    },

    getApiOptions: function (servicePath, callbackMethod, errorCallbackMethod, callbackData, requestData) {
        var _this = this;

        if (typeof requestData == 'undefined')
            requestData = {};

        if (typeof callbackMethod == 'undefined'
            || callbackMethod == null)
            callbackMethod = function (data) { _this.ExecuteCallBack(callbackData, data); };
        var baseUrl = 'http://insideview.allianceglobalservices.com/alfresco/service/api/';

        var options = {
            url: baseUrl + servicePath,
            dataType: 'json',
            timeout: 45000,
            success: callbackMethod,
            error: function (xhr, desc, exceptionobj) { _this.ServerErrorParser(xhr, desc, exceptionobj, errorCallbackMethod); },
            beforeSend: function (o, s) {
                //var tok = localStorage.getItem("username") + ':' + localStorage.getItem("password");
                //var hash = Base64.encode(tok);
                //o.setRequestHeader("Authorization", "Basic " + hash);
                //o.setRequestHeader("Access-Control-Allow-Origin", "*");
            }
        };
        options.data = requestData;
        return options;
    },

    /// <summary>
    /// The default call back for server requests
    /// </summary>
    /// <param name="param">description</param>
    /// <returns>return</returns>
    ServerRequestCallBack: function (requestDetails, resultData) {
    },

    /// <summary>
    /// This method is called when a server request failed. It parses the errors object and calls the error callback
    /// </summary>
    ServerErrorParser: function (xhr, desc, exceptionobj, errorCallBack) {
        var errors = this.ParseServerError(xhr);
        var isCallerHandlingValidationErrors = this.isCallerHandlingValidationErrors(errorCallBack);
        if (isCallerHandlingValidationErrors) // && this.isHandledException(errors))
            errorCallBack(errors);
        else
            this.ServerRequestError(null, errors);
    },

    isHandledException: function (errors) {
        return (errors.status != "500"); //status code 500,0 is unhandled
    },

    isCallerHandlingValidationErrors: function (errorCallBack) {
        return !(typeof errorCallBack == 'undefined' || errorCallBack == null);
    },

    /// <summary>
    /// This is the default error callback, if no error callback was set, it will be called and will log the user out
    /// </summary>
    ServerRequestError: function (data, errors) {
        if (AGS.Model.Common.onServerRequestError) {
            AGS.Model.Common.onServerRequestError(data, errors);
        }
    },


    /// <summary>
    /// This function parses the returned xhr objects and returns the error message
    /// </summary>
    /// <param name="xhr">The xhr object returned from the server call</param>
    /// <returns>return</returns>
    ParseServerError: function (xhr) {
        var response = {};
        try {
            var responseText = xhr.responseText;

            if (responseText.endsWith('null')) //null is appended to the error json string when the method return type is an object
                responseText = responseText.substr(0, responseText.length - 4);

            if (responseText.endsWith('-1')) //-1 is appended to the error json string when the method return type is int
                responseText = responseText.substr(0, responseText.length - 2);

            if (responseText.indexOf("{\"d\":null}") >= 0)
                responseText = responseText.replace("{\"d\":null}", "");
            if (responseText.indexOf("{\"d\":-1}") >= 0)
                responseText = responseText.replace("{\"d\":-1}", "");
            response = JSON.parse(responseText);
        } catch (error) {
            response = { Error: { errorCode: -1, message: 'unknown.error'} };
        }
        response.status = xhr.status;
        return response;
    },

    GetErrorMessage: function (errorObject) {
        var message = errorObject.Error.Message;

        try {
            var errors = eval((message.charAt(0) == "{" ? '[' + message + ']' : message));
            return errors;
        } catch (ex) {
        }

        return message;
    },

    ExecuteCallBack: function (callbackData, data) {
        if (typeof callbackData.callBack == "object") {
            callbackData.callBack.method.apply(callbackData.callBack.context, [data]);
        } else if (typeof callbackData.callBack == "function") {
            callbackData.callBack(data);
        }
    }
};
