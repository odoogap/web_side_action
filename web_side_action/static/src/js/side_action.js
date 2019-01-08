odoo.define('web.sideaction',function(require){
"use strict";
	
	var core = require('web.core');
	var qweb = core.qweb;

	var ListController = require("web.ListController");
	var ListRenderer = require("web.ListRenderer");

	var KanbanController = require('web.KanbanController');
	var KanbanRenderer = require('web.KanbanRenderer');

	var FormController = require('web.FormController');
	var FormRenderer = require('web.FormRenderer');

	var get_action_details = function(self, action_data){
		console.log("self ", self, action_data);
    	return self._rpc({
            model: action_data.type,
            method: 'read',
            args: [action_data.id, ["type","name","tag","res_model","views","view_type","view_mode","target","context","domain"]],
        });
	}

	var get_action_type = function(self, action_id){
		console.log("self ", self);
    	return self._rpc({
            model: 'ir.actions.actions',
            method: 'read',
            args: [action_id, ["type","name"]],
        });
	}

	var get_action_id = function(self, xmlid){
		return self._rpc({
            model: 'ir.model.data',
            method: 'xmlid_to_res_id',
            kwargs: {xmlid: xmlid},
        });
	}

	var setup_extra_buttons = function(target){
		var self = target;
		if(!self.side_action){
			return;
		}
    	get_action_id(self, self.side_action).then(function(action_id){
    		get_action_type(self, action_id).then(function(action_data){
    			var action_data = action_data[0]
	    		self.side_action_name = action_data.name;
				$(document).find("[data-action='" + self.side_action + "']").html(self.side_action_name);

    			get_action_details(self, action_data).then(function (finalresult) {
    				self.sideactions[self.side_action] = finalresult[0];
        			self.$buttons.on('click', '.o_list_button_extra', self._clickExtraButtons.bind(self));
        		});
    		})
    	});
	}

	ListRenderer.include({
	    init: function (parent, state, params) {
        	this._super.apply(this, arguments);
        	this.side_action = this.arch.attrs.side_action;
        	console.log("this.side_action ", this.side_action);
	    },
	});

	ListController.include({
		renderButtons: function ($node) {
			var self = this;
            self.side_action = self.renderer.side_action;
        	self.side_action_name = '';
        	self.sideactions = {}
    		setup_extra_buttons(self);
			self._super.apply(this, arguments);
		},
	    _clickExtraButtons: function (event) {
	        event.stopPropagation();
	        var action_data = this.sideactions[$(event.target).data('action')];
	        this.do_action(action_data);
	    },
	});

	KanbanRenderer.include({
	    init: function (parent, state, params) {
        	this._super.apply(this, arguments);
        	this.side_action = this.arch.attrs.side_action;
	    },
	});
	
	KanbanController.include({
	    init: function () {
	        this._super.apply(this, arguments);
	    },
	    renderButtons: function () {
	    	var self = this;
            self.side_action = self.renderer.side_action;
        	self.side_action_name = '';
        	self.sideactions = {}

	        this._super.apply(this, arguments);
        	setup_extra_buttons(this);
	    },
	    _clickExtraButtons: function (event) {
	        event.stopPropagation();
	        var action_data = this.sideactions[$(event.target).data('action')];
	        this.do_action(action_data);
	    },
	});

	FormRenderer.include({
	    init: function (parent, state, params) {
        	this._super.apply(this, arguments);
        	this.side_action = this.arch.attrs.side_action;
        	console.log("form this.side_action ", this.side_action);
	    },
	});
	
	FormController.include({
	    init: function () {
	        this._super.apply(this, arguments);
	    },
	    renderButtons: function () {
	    	var self = this;
            self.side_action = self.renderer.side_action;
        	self.side_action_name = '';
        	self.sideactions = {}

	        this._super.apply(this, arguments);
        	setup_extra_buttons(this);
	    },
	    _clickExtraButtons: function (event) {
	        event.stopPropagation();
	        var action_data = this.sideactions[$(event.target).data('action')];
	        this.do_action(action_data);
	    },
	});

});
