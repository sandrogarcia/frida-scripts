var base = Module.findBaseAddress("libg.so");

var mallocPtr = Module.findExportByName("libc.so", "malloc");
var DebugMenuCtorPtr = 0x004BD40 + 1;
var GameModeAddResourcesToLoadPtr = 0x00A2BB0 + 1;
var ResourceListenerAddFilePtr = 0x01351B0 + 1;
var StageAddChildPtr = 0x013EEB0 + 1;
var StageCtorPtr = 0x013D310 + 1;
var MoneyHudCtorPtr = 0x00705C0 + 1;
var HudUpdatePtr = 0x0068568 + 1;
var DebugMenuBaseUpdatePtr = 0x004CD84 + 1;

var malloc = new NativeFunction(mallocPtr, 'pointer', ['int']);
var fDebugMenuCtor = new NativeFunction(base.add(DebugMenuCtorPtr), "void", ["pointer"]);
var fResourceListenerAddFile = new NativeFunction(base.add(ResourceListenerAddFilePtr), "void", ["pointer", "pointer"]);
var fStageAddChild = new NativeFunction(base.add(StageAddChildPtr), "int", ["pointer", "pointer"]);
var fDebugMenuBaseUpdate = new NativeFunction(base.add(DebugMenuBaseUpdatePtr), "int", ["pointer", "float"]);

var stage_address;
var dptr = malloc(1000);
base.add(0x03A96D8).writeU8(1); //offline mode

var load = Interceptor.attach(base.add(GameModeAddResourcesToLoadPtr), {
	onEnter: function(args) {
		load.detach();
		fResourceListenerAddFile(args[1], base.add(0x030BB9A)); //load debug.sc
	}
});

var stage = Interceptor.attach(base.add(StageCtorPtr), {
	onEnter: function(args) {
		stage.detach();
		stage_address = args[0];
	}
});

var gameLoaded = Interceptor.attach(base.add(MoneyHudCtorPtr), {
	onEnter: function(args) {
		gameLoaded.detach();
		fDebugMenuCtor(dptr);
		fStageAddChild(stage_address, dptr);
	}
});

var hudUpdate = Interceptor.attach(base.add(HudUpdatePtr), {
	onEnter: function(args) {
		fDebugMenuBaseUpdate(dptr, 20);
	}
});