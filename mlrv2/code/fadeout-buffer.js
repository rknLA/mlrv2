
var pb;
var pbName = '';

var fade_sample_count = 200;

var buf;
var buf_ix = 0;
var master_loop_length_samps = 0;
var master_loop_length_ms = 0;
var sample_rate = 0;


function sr(samp_rate) {
	sample_rate = samp_rate
	fade_sample_count = Math.floor(0.005 * sample_rate);
}

function set_file(file_ix) {
	buf_ix = file_ix;
	var buf_name = buf_ix + "file";
	buf = new Buffer(buf_name);
	post("set fadeout buffer to " + buf_name);
	post();
}

function msg_int(end_ix) {
	var start_fade_ix = end_ix - fade_sample_count
	// linear fade!
	var fade_increment = 1.0 / fade_sample_count
	//post("fade increment is " + fade_increment)
	//post()
	for (var ch = 1; ch <= buf.channelcount(); ++ch) {
		var fade_val = 1.0;
		var sample_vals = buf.peek(ch, start_fade_ix, fade_sample_count);
		for (var i = 0; i < fade_sample_count; ++i) {
			fade_val = fade_val - fade_increment;
			var orig_val = sample_vals[i];
			sample_vals[i] = orig_val * fade_val;
		}
		//post("fade val at the end of channel " + ch + " is " + fade_val)
		//post()
		buf.poke(ch, start_fade_ix, sample_vals)
	}
	post("done with fade");
	post();
	if (buf_ix == 1) {
		master_loop_length_samps = end_ix;
			//buf.set_framecount(end_ix);
		for (item in buf) {
			post(item + ": " + buf[item]);
			post();
		}
		var len_in_ms = 1000 * end_ix / sample_rate;
		master_loop_length_ms = len_in_ms;
		post("buffer length in ms should be: " + len_in_ms);
		post();
		buf.send('crop', 0, len_in_ms);
	} else {
		post("end_ix is " + end_ix + " (of master length " + master_loop_length_samps + ")");
		post();
		var truncate_factor = 1.0;
		var truncated_length = truncate_factor * master_loop_length_samps;
		var finishing_factor = 1.0;
		while (end_ix < truncated_length) {
			truncate_factor *= 0.5;
			truncated_length = truncate_factor * master_loop_length_samps;
		}
		while (end_ix > truncated_length) {
			truncate_factor *= 2;
			truncated_length = truncate_factor * master_loop_length_samps;
		}
		var target_len_ms = 1000 * truncated_length / sample_rate;
		buf.send('crop', 0, target_len_ms);
	}
	outlet(0, buf_ix, buf.framecount());
	post("truncated buffer to " + buf.framecount());
	post();
}