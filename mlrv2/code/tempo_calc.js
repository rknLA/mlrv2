var beats = 16;

outlets = 3;

function beats(beatsPerMeasure) {
	beats = beatsPerMeasure;
}

function msg_float(loopLengthMillis) {
	if (loopLengthMillis <= 0.0 ) {
		post("can't process loop length of 0 or less!")
		post();
		return;
	}
	
	var millisPerSecond = 1000;
	var secondsPerMinute = 60
	
	var bpm = beats * millisPerSecond * secondsPerMinute / loopLengthMillis;
	var rawBpm = bpm;
	//post("raw bpm is " + rawBpm)
	//post();
	
	var scaleFactor = 1.0;
	while (bpm > 135) {
		bpm = bpm / 2.0;
		scaleFactor = scaleFactor / 2.0;
	}
	while (bpm < 55) {
		bpm = bpm * 2.0;
		scaleFactor = scaleFactor * 2.0;
	}
	
	outlet(2, rawBpm);
	outlet(1, scaleFactor);
	outlet(0, bpm);
}
