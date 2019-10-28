/*** SetUserCodeDevice Z-Way Home Automation module *************************************

 Author: Ben Windheim (ben.windheim@vacasa.com) 
 Description: Virtual device representation to receive codes and scheduling

******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------
SetUserCodeDevice = function (id, controller) {
	SetUserCodeDevice.super_.call(this, id, controller);

	this.deviceType = "virtual";
	//this.deviceSubType = "doorlock";

};

inherits(SetUserCodeDevice, VirtualDevice);

// override base class performCommand()
SetUserCode.prototype.performCommand = function (command) {
	var handled = true;
	if("setcode" === command) {
		for (var id in zway.devices) {
			zway.devices[id].UserCode.Set(0x0d, 1234, 0x01);
		}
	} else {
		handled = false;
	}

	return handled ? true;
	SetUserCode.super_.prototype.performCommand.call(this, command);
};	

