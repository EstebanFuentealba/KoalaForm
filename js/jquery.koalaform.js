/*
 * JQuery KoalaForm
 * @Version: 2.2
 * @Requiere:
 *          JQuery >= 1.5 ,
 *          JQuery-UI >= 1.8
 * @Autor: Esteban Fuentealba
 * @Email: msn [at] estebanfuentealba [dot] net
 *
 */

$.extend({
	/* HERRAMIENTAS */
	KoalaFormHide: function(formid) {
		if($.isUndefined(formid)){
			$(".ui-koalaform-formbox").each(function(){ $('input[type="submit"]',$(this)).attr("disabled",false); var settings = $.KFWGetSettings($(this)); $("#"+settings.msg_box_id).hide("fast",function() { $(this).remove(); }); });
		}else if(typeof formid === "object"){
			$('input[type="submit"]',$(formid)).attr("disabled",false); var settings = $(formid).data("KoalaSettings");  $("#"+settings.msg_box_id).hide("fast",function() { $(this).remove(); });
		}else{
			$('input[type="submit"]',$("#"+formid)).attr("disabled",false); var settings = $("#"+formid).data("KoalaSettings"); $("#"+settings.msg_box_id).hide("fast",function() { $(this).remove(); });
		}
		$.KFWOverlay("hide");
	},
	KFWOverlay: function(options){
		if($("#koala-form-overlay").length > 0){
			if(typeof options === "string") {
				switch(options){
					case "show": $("#koala-form-overlay").show(); break;
					case "hide": $("#koala-form-overlay").fadeOut(500); break;
				}
			}
		}
	/*## TODO CALZA POLLO ##*/
        },
	KFWGetFormByElement:function(element){ return $(element).closest("form"); },
	KFWGetSettings:function(element){
                if($(element).is("form")){ return $(element).data("KoalaSettings"); }
		return ($.KFWGetFormByElement(element)).data("KoalaSettings");
	},
	KoalaFormMsgBox:function(titulo,msg,type,settings,icon){
		//#koalaFormBox > div > p
		var d = $("<div>").attr("id",((settings==null)?"koalaFormBox":settings.msg_box_id)).addClass("ui-widget").append($("<div>").css({"display": "none","cursor":"pointer","text-align":"center","position":"fixed","top":0,"width":"100%","z-index":5}).append($("<p>").addClass("ui-state-highlight ui-corner-all").css({"text-align":"justify","margin":"0 auto 0 auto","padding":"0.7em","width":"500px","font-size":"0.7em"}).append($("<span>").addClass(((type=="ok")?"ui-icon ui-icon-circle-check":((icon!=null)?icon:"ui-icon ui-icon-info"))).css({"float":"left","margin-right":".3em"}) ).append((titulo+": "+msg ))).click(function() { $.KFWOverlay("hide"); $(this).fadeOut(((settings==null)?300:settings.fadeOutTime)); }).show("fast", function(){ if($.browser.msie != true) { $(this).effect("bounce", { times:3 }, 300); } }));
		if(type=="ok") {$.KFWOverlay("show");}
		return d.appendTo($("body"));
	},
	KoalaFormAfter:function(fn,element) {
		if(fn!= null) {
			if($.isFunction(fn)) { fn($(element)); }
			else if($.isFunction(eval(fn))) {eval(fn+"($(element))"); }
		}
	},
	/* Motor  #########################*/
	msgMotor : function(obj,type,form) {
		var defaults = null,isValid=true;
		if(obj!=null) {
			var msg="", errorList = ($.isArray(obj)?obj:[obj]);
			$.each(errorList,function(index,e) {
				if(defaults==null){ defaults = $.KFWGetSettings($.KFWGetFormByElement(e.element)); }
				if(e.element.data("KoalaElement").isValid){ $(e.element).removeClass("ui-state-error"); }
				else {
					isValid = false;
					if(defaults.highlightErrors) { $(e.element).addClass("ui-state-error"); }
					msg += (defaults.use_css)?"<li><b>"+e.titulo+"</b>: ":e.titulo.toUpperCase()+": ";
					$.each(e.errores,function(index,error) { msg += error; if(index < (e.errores.length-1)) {  msg +=", "; } });
					msg += (defaults.use_css)?"</li>":"\r\n";
					if(defaults.onError!=null && $.isFunction(defaults.onError)) { $(document).trigger("onError",[$(e.element),e.errores]); }
				}
			});
		} else { if(defaults==null){ defaults = $.KFWGetSettings($(form)); } }
		$.KoalaFormHide();
		if(!isValid) {
			if(defaults.use_css) {
				if(defaults.showMessages) { $.KoalaFormMsgBox("<strong>Mensaje de error</strong>","<ul>"+msg+"</ul>",type,defaults,"ui-icon ui-icon-alert"); }
				else { alert(msg); }
			}
		} else {$.KoalaFormHide();}
		return isValid;
	},
	/* Attach  #########################*/
	attachValidation : function(element) {
		var total_clases = element.attr("class").split(" ").length;
		var settings = $.KFWGetSettings(element);
		/* ? */
		if($.isUndefined(settings)){
			$.KFWGetFormByElement(element).KoalaForm();
			settings = $.KFWGetSettings(element);
		}
		var $element = $(element);
		var es = {
			validations:[],
			isRequired: function(){ return $element.hasClass("novacio"); },
			isValid: false, errores: new Array(),
			validate:function(){
				var necesario=0,validado=0;es.isValid = false,es.errores=new Array(),
					$labelForElement = $("label[for='"+$($element).attr("id")+"']"),
					eName = (($labelForElement.size()>0)?$labelForElement.text(): (($($element).is("input")) ? $($element).attr("name") : $($element).attr("id")));
				$.each(es.validations,function(i,o){
					if(es.isRequired() || $.isNotVacio($element)&& !es.isRequired()){ necesario++; }
					if((($.isFunction(o.fn))?o.fn($element): ($.isFunction(eval(o.fn)))?eval(o.fn+"($element,"+$element.data("KoalaElementParams")+")"):true)) { validado++; }
					else{
						var msg = (($element.is("fieldset"))?(($.isNotVacio($element.attr("title")) && !$.isUndefined($element.attr("title")))?$element.attr("title"):o.msg):(($.isNotVacio($element.attr("alt")) && !$.isUndefined($element.attr("alt")))?$element.attr("alt"):o.msg));
						if($.inArray(msg,es.errores)==-1) { es.errores.push(msg); }
					}
					$.KoalaFormAfter(o.afterFn,$(element));
				});
				es.isValid = (necesario<=validado);
				return { "titulo": eName, "element": $($element), "totalValidaciones": necesario, "validados": validado,"errores": es.errores };
			}
		};
		var isKoalaElement=false;
		$.each(settings.validations,function(i,valid){
			if(total_clases > 0 && element.hasClass(valid.name)) {
				if(valid.accept=="numeric") { $(element).inputNumber(); }
				else if(valid.accept=="hora") { $(element).KFWHora(settings.horaOptions); }
				else if(valid.accept=="add") { $(element).KFWAdd(settings.addOptions); }
				es.validations.push(valid);
				element.data("KoalaElement",es);
				isKoalaElement=true;
			} else {
				var match = $.matchInArray(valid.name,$(element).attr("class").split(" "));
				if(match) {
					isKoalaElement=true;
					if(!$.isUndefined(valid.accept) && valid.accept=="numeric") { $(element).inputNumber(); }
					else {
						var data = $.createMethod(match);
						es.validations.push(valid);
						element.data("KoalaElement",es).data("KoalaElementParams",data.params);
					}
				}
			}
		});
		return isKoalaElement;
	},
	//VALIDACIONES
	cleanNumber: function(value) { return value.toString().replace(/\./g,"").replace(/\ /g,""); },
	isUndefined: function(value) { return (typeof value == 'undefined'); },
	numberFormat: function(element) { return $(element).val($.sNumero($(element).val())); },
	sNumero: function(valor,delimitador) {
		var d=".",prefix="",val=valor.replace(/\./g,"");
		if (!$.isUndefined(delimitador) || delimitador!=null){ d=delimitador; }
		if(valor.substring(0,1)=="-"){
			prefix="-";
			val = val.substring(1,val.length);
		}
		return prefix+""+val.toString().replace(new RegExp("(^\\d{"+(val.toString().length%3||-1)+"})(?=\\d{3})"),"$1"+d).replace(/(\d{3})(?=\d)/g,"$1"+d);
	},
	rutFormat:  function(value) {
		var rutString = ($.cleanNumber(value)).replace(/\-/g,"");
		var rut = rutString.substring(0, rutString.length-1),
			dv = rutString.charAt(rutString.length-1);
		if(rutString.length==0){return;}
		return $.sNumero(rut)+"-"+dv;
	},
	/* KoalaForm Validations  #########################*/
	isPatente: function(element){
			return ((/^[a-z]{2}[\.\- ]?[0-9]{2}[\.\- ]?[0-9]{2}|[b-d,f-h,j-l,p,r-t,v-z]{2}[\-\. ]?[b-d,f-h,j-l,p,r-t,v-z]{2}[\.\- ]?[0-9]{2}$/i).test(element.val()));
	},
	isTelefonoFijo:function(element) {
			var match = (new RegExp(/^(((\(?(\d){1,3}\)?)\-?))?(\d){1}?((\d){6})$/)).exec(element.val());
			if(match){
				var CODIGO_PAIS=3; CODIGO_CIUDAD = 3,CODIGO_FONO_A=5,CODIGO_FONO_B=6;
				var fono="";                            
				/*if(!$.isUndefined(match[CODIGO_PAIS])){
					fono += "+"+match[CODIGO_PAIS].replace("+","").replace(" ","")+" ";
				}*/
				if(!$.isUndefined(match[CODIGO_CIUDAD])){
					fono += "("+match[CODIGO_CIUDAD].replace("(","").replace(")","")+")-";
				}
				if(!$.isUndefined(match[CODIGO_FONO_A])){
					fono += match[CODIGO_FONO_A];
				}
				fono += match[CODIGO_FONO_B];
				element.val(fono);
				return true;
			}
			return false;
	},
	isRut: function(element) {
		var rutString = $(element).val();
		if(rutString.toString().length>0) {
			rutString = $.rutFormat(rutString);
			$(element).val(rutString);
			rutString = ($.cleanNumber(rutString));
			if(/^\d{1,9}[-][0-9|k|K]$/.test(rutString)) {
				var data = ($.cleanNumber(rutString)).split("-");
				return $.ValidDvRut(data[0],data[1]);
			}
		}
		return false;
	},
	ValidDvRut: function(rut,dv) {
		nuevo_numero = rut.toString().split("").reverse().join("");
		for(i=0,j=2,suma=0; i < nuevo_numero.length; i++, ((j==7) ? j=2 : j++)) { suma += (parseInt(nuevo_numero.charAt(i)) * j); }
		n_dv = 11 - (suma % 11);
		return (dv == ((n_dv == 11) ? 0 : ((n_dv == 10) ? "K" : n_dv)));
	},
	isEmail: function(element){ return (/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test($(element).val())); },
	isUrl: function(element){ return (/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test($(element).val())); },
	/* Numeros */
	ceroPositivo:function(element){ var val= $(element).val().replace(/\./g,""); return $.isNumber(val) && val>=0;  },
	positivo:function(element) { var val= $(element).val().replace(/\./g,""); return $.isNumber(val) && val>0; },
	ceroNegativo:function(element){ var val= $(element).val().replace(/\./g,""); return $.isNumber(val) && val<=0;  },
	negativo:function(element){ var val= $(element).val().replace(/\./g,""); return $.isNumber(val) && val<0;  },
	isNotVacio: function(value){
		var valor =null;
		if(typeof value === "object") {
			valor = $(value).val();
			if($(value).is("fieldset")){ return ($("> :input[type='checkbox']",$(value)).filter(":checked").size()); }
			if($(value).is("select")){ return ($(value)[0].selectedIndex != -1); }
		}
		else { valor = value; }
		return (/[A-Za-z0-9_]/.test(valor));
	},
	isHora: function(element) { return (/^(\d+){1,2}\:(\d+){1,2}(:\d{1,2})?( AM| PM)?$/.test((typeof element === "object")?element.val():element)); },
	isNumber : function(value) { return (/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(((typeof value === "object")?value.val():value).replace(/\./g,"").replace(/\,/,"."))); },
	inRango: function(element,between,h) {
		var val = $.cleanNumber($(element).val());
		if(val!=""){
			if($.isArray(between)){
				try {
					var desde= parseInt(between[0]), hasta= parseInt(between[1]);
					return (val >= desde && val <= hasta);
				} catch(e){ }
			} else {
				var desde= between, hasta = h;
				return (val >= desde && val <= hasta);
			}
		}
		return false;
	},
	groupCheck: function(element,compare) {
		var selectedCount = $("> :input[type='checkbox']",$(element)).filter(":checked").size();
		try {
			return eval((selectedCount+""+compare));
		} catch(e){ return false; }
	},
	nextEl: function(e,compare){
		var elements = compare.toString().split(",");
		var oEl = $(e);
		var i=0;
		if($.isArray(elements)) {
			setTimeout(function(){
			i++;
			if(oEl.data("KoalaElement").isValid){ $(document).trigger("onNext",[oEl,elements]); }
			$.each(elements,function(i,o) {
				var element = $("#"+o);
				if(oEl.data("KoalaElement").isValid){
					element.attr("disabled",false);
					if(element.is(":hidden")||element.parent().is(":hidden")) { element.show("fast").parent().show("fast"); }
				} else { element.attr("disabled","disabled").removeClass("ui-state-error"); }
			});
		},150);
		}
		return true;
	},
	confirmWithElement: function(element,idCompara) { return ($(element).val()==$("#"+idCompara).val())?true:false; },
	matchInArray: function(valor,array) {
		for(var i=0; i < array.length; i++) { if(array[i].match("^"+valor)) return array[i]; }
		return false;
	},
	createMethod : function(value) {
		var m= (new RegExp(/^([a-zA-Z].[^_]*)_(.*\,?)_$/g)).exec(value);
		if (m != null) {
			return {
				metod: 	m[1],
				params: "["+$.map(m[2].split(","),function(param,i) {
					var match=null;
					match= (new RegExp(/^equal(\d+)/g)).exec(param);
					if (match != null) { return "'=="+match[1]+"'"; }
					match= (new RegExp(/^notEqual(\d+)/g)).exec(param);
					if (match != null) { return "'!="+match[1]+"'"; }
					match= (new RegExp(/^biggerThan(\d+)/g)).exec(param);
					if (match != null) { return "'>"+match[1]+"'"; }
					match= (new RegExp(/^biggerOrEqual(\d+)/g)).exec(param);
					if (match != null) { return "'>="+match[1]+"'"; }
					match= (new RegExp(/^smallerThan(\d+)/g)).exec(param);
					if (match != null) { return "'<"+match[1]+"'"; }
					match= (new RegExp(/^smallerOrEqual(\d+)/g)).exec(param);
					if (match != null) { return "'<="+match[1]+"'"; }
					return "'"+param.toString()+"'";
				})+"]"
			};
		}
		var matches= (new RegExp(/(.*)\((,?.+)\)/)).exec(value);
		if (matches == null) { return null; }
		return { metod: matches[1], params: matches[2] };
	}
});
$.fn.extend({
	KoalaForm: function(options) {
		var KOALA_FORM_CLASS = "ui-koalaform-formbox";
		var defaults = {
			msg_box_id: "koalaFormBox",use_css: true,addValidation: null,showMessages: true,highlightErrors: true,
			fadeOutTime:200,onError:null,onNext:null,onSuccess:null,ajaxOptions:null,horaOptions:null,addOptions:null,
			disableButtonOnSubmit: true,
			validations: [
				{name:"novacio",fn:"$.isNotVacio",msg:"no puede estar vacio",afterFn:null},
				{name:"rut",fn:"$.isRut",msg:"debe ser válido"},
				{name:"numero",accept:"numeric",fn:"$.isNumber",msg:"debe ser numerico",afterFn: $.numberFormat},
				{name:"email",fn:"$.isEmail",msg:"debe ser valido"},
				{name:"ceroPositivo",accept:"numeric",fn:"$.ceroPositivo",msg:"debe ser mayor o igual a 0",afterFn: $.numberFormat},
				{name:"positivo",accept:"numeric",fn:"$.positivo",msg:"debe ser mayor a 0",afterFn: $.numberFormat},
				{name:"ceroNegativo",accept:"numeric",fn:"$.ceroNegativo",msg:"debe ser menor o igual a 0",afterFn: $.numberFormat},
				{name:"negativo",accept:"numeric",fn:"$.negativo",msg:"debe ser menor a 0",afterFn: $.numberFormat},
				{name:"url",fn:"$.isUrl",msg:"debe ser una url"},
				{name:"decimal",accept:"numeric",fn:"$.isNumber",msg:"debe ser numero decimal",afterFn: $.numberFormat},
				{name:"hora",accept:"hora",fn:"$.isHora",msg:"debe tener un formato de hora valido"},
				{name:"fono",fn:"$.isTelefonoFijo",msg:"debe ingresar un telefono fijo valido"},
				{name:"patente",fn:"$.isPatente",msg:"debe ingresar una patente valida"},
				{name:"same",fn:"$.confirmWithElement",msg:"debe ser igual a"},
				{name:"rangoNumerico",type:"numeric",fn:"$.inRango",msg:"no esta en el rango",afterFn: $.numberFormat},
				{name:"group",fn:"$.groupCheck",msg:"no cumplen la condicion"},
				{name:"next",fn:"$.nextEl",msg:""},
				{name:"addButton",accept:"add",fn:"",msg:""}
			]
		};
		$t = this;
		var settings = $.extend(true,defaults,options);
		if(settings.addValidation!=null && $.isArray(settings.addValidation)){ settings.validations = settings.validations.concat(settings.addValidation); }
		$(this).data("KoalaSettings",settings).addClass(KOALA_FORM_CLASS);
		/* Init  #########################*/
		this.init = function(form,settings) {
			if($("#koala-form-overlay").length == 0){ $('<div id="koala-form-overlay" style="display:none;"><div class="ui-widget-overlay" style="position:fixed;"></div></div>').appendTo($("body")); }
			if($("#koala-style").length == 0){ $("head").attr("id","koala-style").append($('<style>html,body{ margin: 0; padding: 0; } html, body, #koala-form-overlay {height: 100%;} #'+settings.msg_box_id+',#koala-form-overlay { position: absolute;top: expression(document.compatMode=="CSS1Compat"? document.documentElement.scrollTop+"px" : body.scrollTop+"px");}</style>')); }
			if(settings.onError!=null && $.isFunction(settings.onError)) { $(form).bind("onError", settings.onError); }
			/*--Binds--*/
			if(settings.onError!=null && $.isFunction(settings.onError)) { $(document).bind("onError", settings.onError); }
			if(settings.onNext != null && $.isFunction(settings.onNext)) { $(document).bind("onNext",settings.onNext); }
			return form.find(":input[type='text'],textarea,:input[type='file'],:input[type='password'],select,fieldset").each(function() {
				var $element = this;
				if($($element).is("fieldset")){
					if($("> :input[type='checkbox']",$($element)).size()>0){
						$.attachValidation($($element));
						$($element).find("> :input[type='checkbox']").click(function(){ $.msgMotor($(this).parent("fieldset").data("KoalaElement").validate()); });
					}
				} else {
					if($($element).is("select")) { $($element)[0].selectedIndex = -1; }
					var isKoalaElement = $.attachValidation($($element));
					if(isKoalaElement){ /* ON */
						$($element).blur(function(){  $.msgMotor($($element).data("KoalaElement").validate()); });
					}
				}
			});
		};
		return $(this).each(function() {
			var init = $t.init($(this),settings);
			$(this).submit(function(e) {
				//e.preventDefault();
				init = $(this).find(":input[type='text'],textarea,:input[type='file'],:input[type='password'],select,fieldset");
				if(defaults.disableButtonOnSubmit){ $(this).find(":submit").attr("disabled",true); }
				$form = $(this);
				var valid = $.msgMotor($.map(init,function(element,i) {
					var elementData = $(element).data("KoalaElement");
					if(!$.isUndefined(elementData))
					return elementData.validate();
				}));
				if(valid) {
					//$.KoalaFormHide($form.attr("id"));
					$.KoalaFormMsgBox("<strong>OK</strong>","Enviando Datos.","ok",defaults,"ui-icon ui-icon-clock");
					if(defaults.ajaxOptions !=null && !$.isUndefined(defaults.ajaxOptions.url)) {
						//e.preventDefault();
						var method = $form.attr('method');
						var params = $form.serialize();
						var options = { type: method, dataType: "json", data: params };
						$.extend(true,options,defaults.ajaxOptions);
						$.when($.ajax(options)).done(function(ajaxArgs){
							if(defaults.onSuccess!=null && $.isFunction(defaults.onSuccess)) { $form.find(":submit").attr("disabled",false); return defaults.onSuccess($form,ajaxArgs); }
						}).fail(function(){ $(this).find(":submit").attr("disabled",false); });
						$("#"+defaults.msg_box_id).delay(800).fadeOut(400);
						return false;
					}else{
						if(defaults.onSuccess!=null && $.isFunction(defaults.onSuccess)) {
							var retorno = defaults.onSuccess($form);
							$("#"+defaults.msg_box_id).delay(800).fadeOut(400);
							return retorno;
						}
						return true
					}
				} else { $(this).find(":submit").attr("disabled",false); }
				return false;
			});
		});
	},
	KFWAdd: function(options){
		var KOALA_FORM_LIST_INPUT_CLASS = "ui-koalaform-addButton"
		var defaults={ name: null };
		var settings = $.extend(true,defaults,options);
		return $(this).each(function(){
			var $kf = this;
			$($kf).removeClass("addButton").data("KoalaType","Add");
			var labelText = $("label[for='"+$(this).attr("name")+"']").text();
			settings.name = $(this).attr("name");
			var btnAdd = $("<button type='button'>Agregar</button>").button({icons:{primary:'ui-icon-plus'},text:false}).click(function(){
				var index = $('#btnadded_'+settings.name+">ul>li").size()+1,input = $("<input type='text' name='"+settings.name+"[]' id='"+settings.name+"_"+index+"' />").addClass($($kf).attr("class")),li =$("<li>"), btnClose = $("<button type='button'>Remover</button>").button({icons:{primary:'ui-icon-minus'},text:false}).click(function(){
					li.remove();
					$('#btnadded_'+settings.name+">ul>li").each(function(i){
						var input = $(">input",$(this)),label = $(">label",$(this)),new_id = settings.name+""+(i+1);
						input.attr("id",new_id);
						label.html(labelText+" "+(i+1)).attr("for",new_id);
					});
				});
				li.append($("<label>").attr("for",settings.name+"_"+index).append(labelText+" "+index)).append(input.blur(function(){$.msgMotor($(this).data("KoalaElement").validate()); })).append(btnClose).appendTo($('#btnadded_'+settings.name+">ul"));
				$.attachValidation($(input));
			});
			$(this).replaceWith($("<div style='display: inline;'>")	.addClass(KOALA_FORM_LIST_INPUT_CLASS).append(btnAdd).append($("<div id='btnadded_"+settings.name+"'><ul></ul></div>")));
		});
	},
	KFWHora: function(options){
		var defaults = {
			meridiano: true,
			seccion:true,
			increment:15,
			startTime:"8:00:00",
			endTime:"18:30",
			showSeconds:false,
			showButtonBar:false,
			selectedTime: null
		};
		var settings = $.extend(true,defaults,options);
		var $t = this;
		this.stringToDate = function(value) {
			var match = (new RegExp(/^(\d+){1,2}\:(\d+){1,2}(:\d{1,2})?( AM| PM)?$/)).exec(value);
			if(match!=null) { return new Date(0, 0, 0, (!$.isUndefined(match[1])?match[1]:0), (!$.isUndefined(match[2])?match[2]:0), (!$.isUndefined(match[3])?match[3].substring(1):0)); }
			return null;
		};
		this.formatTime = function(date) { return $t.frmNumber(date.getHours())+":"+$t.frmNumber(date.getMinutes())+""+((settings.showSeconds)?":"+$t.frmNumber(date.getMilliseconds()):"")+(settings.meridiano ? " "+((date.getHours()<12)?"AM":"PM"):""); };
		this.frmNumber=function(numero){ return (numero<10?"0":"")+numero; };
		return $(this).each(function(){
			$(this).data("KoalaType","Hora");
			var start= new Date(0, 0, 0, 0, 0, 0),end= new Date(0, 0, 0, 24, 0, 0);
			if(settings.startTime!=null) {
				var date = $t.stringToDate(settings.startTime);
				start = (date!=null)?date:start;
			}
			if(settings.endTime!=null) {
				var date = $t.stringToDate(settings.endTime);
				end = (date!=null)?date:end;
			}
			var time = $("<select>"),hora = $("<select>"),minutos = $("<select>"),horaAnterior = -1,counter=-1;
			while(start <= end) {
				if(start.getHours()!=horaAnterior) {
					hora.append($("<option>").append($t.frmNumber(start.getHours())));
					counter++;
				}
				if(counter==1){ minutos.append($("<option>").append($t.frmNumber(start.getMinutes())));}
				time.append($("<option>").append($t.formatTime(start)));
				horaAnterior=start.getHours();
				start.setMinutes(start.getMinutes() + ((((60/settings.increment)%2)==0)?settings.increment:1));
			}
			var meridiem = $("<select>").append($("<option>AM</option>")).append($("<option>PM</option>")).attr("disabled",true);
			if(settings.selectedTime!=null){
				var date = $t.stringToDate(settings.selectedTime);
				time.val($t.formatTime(date));
				hora.val($t.frmNumber(date.getHours()));
				minutos.val($t.frmNumber(date.getMinutes()));
				meridiem.val((date.getHours()<12)?"AM":"PM");
			}
			var arr = [hora,minutos];
			if(settings.meridiano){ arr.push(meridiem); }
			$(this).KFWData({html: ((settings.seccion)?arr:[time]),showButtonBar:settings.showButtonBar },function(){
				meridiem.val((hora.val()<12)?"AM":"PM");
				return ((settings.seccion)?hora.val()+":"+minutos.val()+((settings.showSeconds)?":00":"")+((settings.meridiano)? " "+meridiem.val() :""):time.val());
			});
		});
	},
	KFWData: function(settings,fn){
		var KOALA_FRAMEWORK_DATA_CLASS = "ui-koalaform-data";
		var defaults = { showButtonBar:false };
		$.extend(true,defaults,settings);
		return $(this).each(function() {
			var id = "koalaForm_div_"+(Math.ceil(Math.random()*100)),$t=this;
			var position = $(this).position();
			position.top += $(this).get(0).offsetHeight;
			var data = $("<div style='padding:.2em; text-align: center; width: 10em;' class='ui-widget-header ui-helper-clearfix'></div>");
			var divAbsolute =	$('<div id="'+id+'" class="ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>').css({position: 'absolute', display: 'none', left: position.left + 'px', top: position.top + 'px'}).addClass(KOALA_FRAMEWORK_DATA_CLASS)
			$.each(settings.html,function() {
				if($(this).is("select")) { $(this).change(function(){ if(fn!=null&&$.isFunction(fn)){ $($t).val(fn()); } }); }
				data.append($(this));
			});
			var btnCancelar = $("<button type='button' style='margin: .5em .2em .4em; cursor: pointer; padding: .2em .6em .3em .6em; width:auto; overflow:visible;' class='ui-state-default ui-priority-secondary ui-corner-all'>Cancelar</button>").click(function(){divAbsolute.hide();});
			var btnOk = $("<button type='button' style='margin: .5em .2em .4em; cursor: pointer; padding: .2em .6em .3em .6em; width:auto; overflow:visible;' class='ui-state-default ui-priority-primary ui-corner-all'>OK</button>").click(function(){$($t).val(fn()).trigger("blur"); divAbsolute.hide();});
			if(settings.showButtonBar){
				data.append($("<div style='background-image: none; margin: .7em 0 0 0; border-left: 0; border-right: 0; border-bottom: 0;' class='ui-widget-content'></div>").append(btnCancelar).append(btnOk));
			}
			divAbsolute.append(data).appendTo($("body"));
			this.setPosition = function(){
				var position = $($t).position();
				position.top += $($t).get(0).offsetHeight;
				$("#"+id).css({position: 'absolute', left: position.left + 'px', top: position.top + 'px'});
			};
			this._setData = function(){
				if(fn!=null&&$.isFunction(fn)){
					if($($t).val()==""){
						//if(!divAbsolute.is(":hidden")) { $($t).val(fn()); }
					} else { $($t).val(fn()).trigger("blur"); }
				}
			};
			this._checkExternalClick = function(event) {
				var $target = $(event.target);
				if ($target[0].id != id && $target.parents('#'+id).length == 0 && !$($target).hasClass(KOALA_FRAMEWORK_DATA_CLASS)){
					$t._setData();
					divAbsolute.hide();
				}
			};
			$(document).mousedown($t._checkExternalClick);
			$(this).attr('autocomplete', 'off').blur(function(){$t._checkExternalClick;}).focus(function(){ $t.setPosition(); divAbsolute.show(); }).click(function(){$t.setPosition(); divAbsolute.show();});
		});
	},
	inputNumber: function(decimal){
		return $(this).each(function() {
			$(this).keypress(function(e) {
				var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
				if(key == 13) { return true; }
				if((e.ctrlKey && key == 97 ) || (e.ctrlKey && key == 65) ) return true;
				if((e.ctrlKey && key == 120 ) || (e.ctrlKey && key == 88) ) return true;
				if((e.ctrlKey && key == 99 ) || (e.ctrlKey && key == 67) ) return true;
				if((e.ctrlKey && key == 122 ) || (e.ctrlKey && key == 90) ) return true;
				if((e.ctrlKey && key == 118 ) || (e.ctrlKey && key == 86) || (e.shiftKey && key == 45)) return true;
				if(key < 48 || key > 57){
					if(parseInt(key)==parseInt(("-").charCodeAt(0))) {
						var ev = this.jquery ? this[0] : this;
						if('selectionStart' in ev && (ev.selectionStart==0)){
							return !$(this).val().match(/\-/);
						} else {
							/* IE */
							if(document.selection) {
								ev.focus();
								var r = document.selection.createRange();
								if (r == null) { return false; }
								var re = ev.createTextRange();
								var rc = re.duplicate();
								re.moveToBookmark(r.getBookmark());
								rc.setEndPoint('EndToStart', re);
								if(rc.text.length==0) {
									return !$(this).val().match(/\-/);;
								}
							}
						}
						return false;
					}
					if(!$.isUndefined(decimal) && decimal!="" && key == decimal.charCodeAt(0)){
						if($(this).val().match(/\.|\,/)) { return false; }
						return true;
					}
					return false;
				}
			});
			$(this).bind('paste', function(e){
				var o = $(this);
				setTimeout(function() { if(!$.isNumber($(o).val())) { $(o).val(''); } }, 100);
			});
		});
	}
});