/*** AutoLock Z-Way Home Automation module *************************************

 Version: 1.2
 (c) Z-Wave.Me, 2017

 -----------------------------------------------------------------------------
 Author: Yurkin Vitaliy <aivs@z-wave.me>
 Description: Door/Window Sensor automatically closes lock after delay when door is closed

******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------
function Lock (id, controller) {
	// Call superconstructor first (AutomationModule)
	Lock.super_.call(this, id, controller);

	// Create instance variables
	this.timer = null;
};

inherits(Lock, AutomationModule);
_module = Lock;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------
Lock.prototype.init = function (config) {
	// Call superclass' init (this will process config argument and so on)
	Lock.super_.prototype.init.call(this, config);

	var self = this;
	
	// handler - it is a name of your function
	this.handler = function (vDev) {
		var nowSensorStatus = vDev.get("metrics:level");
		// Clear delay if door opened
		clearTimeout(self.timer);
		var vDevDoorLock = self.controller.devices.get(self.config.DoorLock);
		var doorLockState = vDevDoorLock.get("metrics:level");
		if (doorLockState == "close") {
			self.controller.devices.get(self.config.DoorLock).performCommand("open");
		}
		// Close lock if sensor false
			// Start Timer
		self.timer = setTimeout(function () {					
			doorLockState = vDevDoorLock.get("metrics:level");
			var doorLockDeviceType = vDevDoorLock.get("deviceType");

			// Check lock, if already closed don't send command
			if (!(self.config.doNotSendCommand && (doorLockState == "close" || doorLockState == "on"))) {
				// Close lock 
				if (doorLockDeviceType == "doorlock") {
					self.controller.devices.get(self.config.DoorLock).performCommand("close");	
				}
				if (doorLockDeviceType == "switchBinary") {
					self.controller.devices.get(self.config.DoorLock).performCommand("on");	
				}
			}
			// And clearing out this.timer variable
			self.timer = null;
		}, self.config.delay*1000);
	};

	// Setup metric update event listener
	this.controller.devices.on(this.config.BinarySensor, 'change:metrics:level', this.handler);
};

Lock.prototype.stop = function () {
	Lock.super_.prototype.stop.call(this);

	if (this.timer)
		clearTimeout(this.timer);

	this.controller.devices.off(this.config.BinarySensor, 'change:metrics:level', this.handler);
};
