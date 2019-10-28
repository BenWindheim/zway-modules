/*** AutoSetUserCode Z-Way Home Automation module *************************************

 Version: 1.2
 (c) Z-Wave.Me, 2017

 -----------------------------------------------------------------------------
 Author: Ben Windheim (ben.windheim@vacasa.com) 
 Description: Door SetUserCodes and unSetUserCodes on a timer

******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------
function SetUserCode (id, controller) {
	console.log("[DIY] BEGIN");
	// Call superconstructor first (AutomationModule)
	SetUserCode.super_.call(this, id, controller);
	// Create instance variables
	// this.timer = null;

	this.DoorLockDev = undefined;
	this.langFile = undefined;
	this.devices = ['DoorLock'];
	this.iconPath = '/ZAutomation/api/v1/load/modulemedia/'+this.constructor.name;
};

inherits(SetUserCode, AutomationModule);
_module = SetUserCode;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------
SetUserCode.prototype.init = function (config) {
	// Call superclass' init (this will process config argument and so on)
	SetUserCode.super_.prototype.init.call(this, config);
	var self = this;

	self.langFile = self.controller.loadModuleLang(self.constructor.name);

	self.vDevDoorLock = self.controller.devices.create({
		deviceId: "SetUserCode_" + self.id,
		defaults: {
			metrics: {
				title: self.langFile.m_title,
				level: 'close', 
				icon: self.iconPath+'/icon.png'
			}
		},
		overlay: {
			deviceType: 'doorlock'
		},
		handler: function (command,args) {
			console.log("[DIY] vDevDoorLock handler");
			if(command === "setCode") {
				zway.devices[11].UserCode.Set(0x0d, 4321, 0x01);
			} else {
				self.DoorLockDev.performCommand(command);
			}
		},
		moduleId: self.id
	});
	console.log("[DIY] Device created");
	self.initCallback();
};

SetUserCode.prototype.initCallback = function() {
	console.log("[DIY] initCallback");
	var self = this;
	_.each(self.devices, function(type) {
		var deviceId = self.config[type];
		var vDev = self.controller.devices.get(deviceId);
		self[type+'Dev'] = vDev;
	});
	console.log("[DIY] performing command");
	self.vDevDoorLock.performCommand("setCode");
};

SetUserCode.prototype.stop = function () {
	console.log("[DIY] Stop function");
	SetUserCode.super_.prototype.stop.call(this);

	// if (this.timer) {
	// 	clearTimeout(this.timer);
	// }
	// this.controller.devices.off(this.config.DoorLock, "change:metrics:level", this.handler);
};