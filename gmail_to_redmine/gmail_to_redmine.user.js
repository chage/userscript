// ==UserScript==
// @name           GMail to Redmine
// @namespace      redmine
// @description    GMail to Redmine
// @author         chage
// @match          https://mail.google.com/mail/*
// @version        0.1.5
// @downloadURL    https://github.com/chage/userscript/raw/master/gmail_to_redmine/gmail_to_redmine.user.js
// @updateURL      https://github.com/chage/userscript/raw/master/gmail_to_redmine/gmail_to_redmine.meta.js
// @require        https://code.jquery.com/jquery-1.11.1.min.js
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_deleteValue
// ==/UserScript==

var chage = $.noConflict();

chage(document).on('click', '.chage', function() {
	var t = chage('.chage_target');
	if (GM_getValue('redmine_url') === '') {
		GM_deleteValue('redmine_url');
	}
	if (GM_getValue('redmine_apiKey') === '') {
		GM_deleteValue('redmine_apiKey');
	}
	if (GM_getValue('redmine_project_id') === '') {
		GM_deleteValue('redmine_project_id');
	}
	if ((typeof GM_getValue('redmine_url') === 'undefined')
			|| (typeof GM_getValue('redmine_apiKey') === 'undefined')
			|| (typeof GM_getValue('redmine_project_id') === 'undefined')) {
		showAPIKeyDialog();
	} else {
		var start_date = get_datetime_str();
		var d = new Date(t.find('.g3').attr('alt'));
		if (d.toString() !== 'Invalid Date') {
			start_date = get_datetime_str(d);
		}
		var data = {
			subject: chage(document).find('.nH .ha .hP').text(),
			description: (t.find('.a3s').prop('textContent') || t.find('.a3s').prop('innerText'))
			start_date: start_date
		}
		data.project_id = GM_getValue('redmine_project_id');
		chage.ajax({
			type: 'POST',
			url: GM_getValue('redmine_url') + '/issues.json',
			data: JSONStringify({ issue: data }),
			headers: {
				'Content-Type': 'application/json',
				'X-Redmine-API-Key': GM_getValue('redmine_apiKey')
			}
		}).done(function(data) {
			runMario(chage('.chage_container'), 2, function() {
				// cancel target mark
				chage('.chage_target').click().removeClass('chage_target');
			});
		});
	}
});
chage(document).on('click', '.nH .h7 .Bk .adn.ads .gs', function() {
	chage('.chage_container').remove();
	if (!chage(this).hasClass('chage_target')) {
		chage(this).addClass('chage_target').find('.gE.iv.gt .gF.gK table.cf.ix').before('<div class="chage_container" style="right: 0; position: absolute;"><div class="chage" style="margin: 0 0 0 3px; padding: 3px 9px; display: inline-block; background-color: #88AABB; border: 1px solid #336699;">唧~加到 Redmine~</div></div>').parent().css('position', 'relative');;
		if (typeof GM_getValue('redmine_apiKey') !== 'undefined') {
			chage('.chage_container').append('<div class="chage_change" style="margin: 0 3px 0 0; padding: 3px 3px; display: inline-block; background-color: #88AABB; border: 1px solid #336699;">改</div>');
			chage('.chage_change').click(showAPIKeyDialog);
		}
	} else {
		chage(this).removeClass('chage_target');
	}
});
function showAPIKeyDialog() {
	// no apiKey saved
	var url = GM_getValue('redmine_url') || '';
	var apiKey = GM_getValue('redmine_apiKey') || '';
	var project_id = GM_getValue('redmine_project_id') || '';
	// input layout
	var chageInputHTML = '<span style="float: right; border: 1px solid #336699; color: red; font-weight: bold;" class="chage_close">X</span>';
	chageInputHTML += 'Site URL: <input type="text" class="chage_input_url" style="border: 1px solid #336699; width: 100px;" placeholder="https://www.redmine.org" value="' + url + '"><br/>';
	chageInputHTML += 'API KEY: <input type="text" class="chage_input_apiKey" style="border: 1px solid #336699; width: 100px;" value="' + apiKey + '"><br/>';
	chageInputHTML += 'Project ID: <input type="text" class="chage_input_project_id" style="border: 1px solid #336699; width: 100px;" placeholder="redmine" value="' + project_id + '"><br/>';
	chageInputHTML += '<input type="button" value="SAVE">';
	var chageInput = chage('<div>').attr('class', 'chage_input').css({
		'opacity': 0.9,
		'position': 'absolute',
		'top': '0px',
		'right': '0px',
		'z-index': '100',
		'background': '#FFFFCC',
		'padding': '5px',
		'border': '1px solid #CCCCCC',
		'text-align': 'left'
	}).append(chageInputHTML);
	chage('body').append(chageInput);
	// events
	// click save button
	chage('.chage_input input[type="button"]').click(function() {
		GM_setValue('redmine_url', chage('.chage_input input.chage_input_url').val());
		GM_setValue('redmine_apiKey', chage('.chage_input input.chage_input_apiKey').val());
		GM_setValue('redmine_project_id', chage('.chage_input input.chage_input_project_id').val());
		chage('.chage_input').remove();
		// reload chage_target
		chage('.chage_target').click().click();
	});
	// click close
	chage('.chage_input .chage_close').click(function() {
		chage('.chage_input').remove();
	});
}
function escapeJSONString(key, value) {
	if (typeof value == 'string') {
		return value.replace(/[^ -~\b\t\n\f\r"\\]/g, function(a) {
			return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		});
	}
	return value;
}
function JSONStringify(data) {
	return JSON.stringify(data, escapeJSONString).replace(/\\\\u([\da-f]{4}?)/g, '\\u$1');
}
function get_datetime_str(datetime_param) {
	var datetime_str = '';
	// transform datetime_param if exist
	var datetime_now = datetime_param || new Date();
	datetime_str = '' + datetime_now.getFullYear() + '-' + ('0' + (datetime_now.getMonth() + 1)).slice(-2) + '-' + ('0' + datetime_now.getDate()).slice(-2);
	//datetime_str += ' ' + ('0' + datetime_now.getHours()).slice(-2) + ':' + ('0' + datetime_now.getMinutes()).slice(-2) + ':' + ('0' + datetime_now.getSeconds()).slice(-2);
	//datetime_str += '.' + ('00' + datetime_now.getMilliseconds()).slice(-3);
	return datetime_str;
}
//display mario
function runMario(obj, seconds, callback) {
	var callback = callback || function() {};
	var isMario;
	if (typeof(isMario) == "undefined") {
		var $marquee = chage('<marquee>').addClass('mario_run').attr({ 'direction': 'right', 'scrolldelay': 3 });
		var $mario = chage('<img>').attr({ 'src': 'data:image/gif;base64,R0lGODlhEQARAPcAAAAAAAAAQAAAgAAA/wAgAAAgQAAggAAg/wBAAABAQABAgABA/wBgAABgQABggABg/wCAAACAQACAgACA/wCgAACgQACggACg/wDAAADAQADAgADA/wD/AAD/QAD/gAD//yAAACAAQCAAgCAA/yAgACAgQCAggCAg/yBAACBAQCBAgCBA/yBgACBgQCBggCBg/yCAACCAQCCAgCCA/yCgACCgQCCggCCg/yDAACDAQCDAgCDA/yD/ACD/QCD/gCD//0AAAEAAQEAAgEAA/0AgAEAgQEAggEAg/0BAAEBAQEBAgEBA/0BgAEBgQEBggEBg/0CAAECAQECAgECA/0CgAECgQECggECg/0DAAEDAQEDAgEDA/0D/AED/QED/gED//2AAAGAAQGAAgGAA/2AgAGAgQGAggGAg/2BAAGBAQGBAgGBA/2BgAGBgQGBggGBg/2CAAGCAQGCAgGCA/2CgAGCgQGCggGCg/2DAAGDAQGDAgGDA/2D/AGD/QGD/gGD//4AAAIAAQIAAgIAA/4AgAIAgQIAggIAg/4BAAIBAQIBAgIBA/4BgAIBgQIBggIBg/4CAAICAQICAgICA/4CgAICgQICggICg/4DAAIDAQIDAgIDA/4D/AID/QID/gID//6AAAKAAQKAAgKAA/6AgAKAgQKAggKAg/6BAAKBAQKBAgKBA/6BgAKBgQKBggKBg/6CAAKCAQKCAgKCA/6CgAKCgQKCggKCg/6DAAKDAQKDAgKDA/6D/AKD/QKD/gKD//8AAAMAAQMAAgMAA/8AgAMAgQMAggMAg/8BAAMBAQMBAgMBA/8BgAMBgQMBggMBg/8CAAMCAQMCAgMCA/8CgAMCgQMCggMCg/8DAAMDAQMDAgMDA/8D/AMD/QMD/gMD///8AAP8AQP8AgP8A//8gAP8gQP8ggP8g//9AAP9AQP9AgP9A//9gAP9gQP9ggP9g//+AAP+AQP+AgP+A//+gAP+gQP+ggP+g///AAP/AQP/AgP/A////AP//QP//gP///yH/C05FVFNDQVBFMi4wAwEAAAAh/htHaWZBbmltIGJ5IE5vYnVoaXJvIEhhdHRvcmkAIfkECQYAEwAsAAAAABEAEQAACFwAJwgcSLCgwQnsEiY8SFChw4UHIUmkRw8SPYYTLFqkuPGiQY0dO3ocOJFiRYmQMJpciVEiO5QYM6JMKLGlS3b0Eo4siBLSQ4YvOyrE+JLi0JgKYcbsqZRhT4YBAQAh+QQJBgATACwAAAAAEQARAAAIVwAnCBxIsKDBgwgJslu4MKFAhhAbHoREkR49SPQSYsRokWNGgxs9egTp8SJFSAktqrSo8SQ7lB8Nmjw5sqDFlzRZkowoESTPngQpMpwwdGJQig6PIi0YEAAh+QQJBgATACwAAAAAEQARAAAIYQAnCBxIsKBBgewSJjxIUKHDhQchSaRHDxI9hhMsWqS48aJBjR07fuxYUSIkjBRTUoxoMqHEgxxbupy4ckLKjJDY0VNIU2DNhxBPFgTKU+hAokUJSlR4dKbSlxgLmow6ISAAOw==' }).css({ 'width': 17, 'height': 17 }).appendTo($marquee);
		$marquee.css({
			'display': 'none',
			'width': '100px',
			'z-index': '-1'
		});
		$marquee.hide().appendTo(obj);
		isMario = true;
	}
	if (isMario) {
		chage('.mario_run').show();
		setTimeout(function(){
			chage('.mario_run').hide();
			callback();
		}, seconds * 1000);
	}
}
