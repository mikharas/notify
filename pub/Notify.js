const MAXIMUMTIMEVALUE = 16;
const BARSPERROW = 3;

const pitchTailDirection = {
  C4: "TAILUP",
  D4: "TAILUP",
  E4: "TAILUP",
  F4: "TAILUP",
  G4: "TAILUP",
  A4: "TAILUP",
  B4: "TAILDOWN",
  C5: "TAILDOWN",
  D5: "TAILDOWN",
  E5: "TAILDOWN",
  F5: "TAILDOWN",
  G5: "TAILDOWN",
};

const noteValueToDuration = {
  1: "SIXTEENTH",
  2: "EIGHTH",
  3: "DOTTEDEIGHTH",
  4: "QUARTER",
  6: "DOTTEDQUARTER",
  8: "HALF",
  12: "DOTTEDHALF",
  16: "WHOLE",
};

const noteDurationToValue = {
  SIXTEENTH: 1,
  EIGHTH: 2,
  DOTTEDEIGHTH: 3,
  QUARTER: 4,
  DOTTEDQUARTER: 6,
  HALF: 8,
  DOTTEDHALF: 12,
  WHOLE: 16,
};

const restToImg = {
  SIXTEENTH: "res/sixteenthRest.png",
  EIGHTH: "res/eighthRest.png",
  DOTTEDEIGHTH: "res/dottedEighthRest.png",
  QUARTER: "res/quarterRest.png",
  DOTTEDQUARTER: "res/dottedQuarterRest.png",
  HALF: "res/halfRest.png",
  DOTTEDHALF: "res/dottedHalfRest.png",
  WHOLE: "res/wholeRest.png",
};

const tailUpNoteToImg = {
  SIXTEENTH: "res/sixteenthUp.png",
  EIGHTH: "res/eighthUp.png",
  DOTTEDEIGHTH: "res/dottedEighthUp.png",
  QUARTER: "res/quarterUp.png",
  DOTTEDQUARTER: "res/dottedQuarterUp.png",
  HALF: "res/halfUp.png",
  DOTTEDHALF: "res/dottedHalfUp.png",
  WHOLE: "res/whole.png",
};
const tailDownNoteToImg = {
  SIXTEENTH: "res/sixteenthDown.png",
  EIGHTH: "res/eighthDown.png",
  DOTTEDEIGHTH: "res/dottedEighthDown.png",
  QUARTER: "res/quarterDown.png",
  DOTTEDQUARTER: "res/dottedQuarterDown.png",
  HALF: "res/halfDown.png",
  DOTTEDHALF: "res/dottedHalfDown.png",
  WHOLE: "res/whole.png",
};

const numToNumImg = {
  2: "res/num2.png",
  3: "res/num3.png",
  4: "res/num4.png",
  6: "res/num6.png",
  8: "res/num8.png",
  9: "res/num9.png",
  12: "res/num12.png",
};

class Staff {
  constructor(clef, noteDuration, noteCount) {
    this.noteDurationValue = noteDurationToValue[noteDuration];
    this.bars = [];
    this.clef = clef;
    this.noteDuration = noteDuration;
    this.noteCount = noteCount;
  }

  changeTimeSignature(noteDuration, noteCount) {
    this.noteDurationValue = noteDurationToValue[noteDuration];
    this.noteDuration = noteDuration;
    this.noteCount = noteCount;
    this.bars = [];
  }

  addBar() {
    this.bars.push(
      new Bar(this.noteDurationValue * this.noteCount, this.bars.length)
    );
  }

  removeBar() {
    this.bars.pop();
  }

  getBar(barIndex) {
    return this.bars[barIndex];
  }

  getNoteDuration() {
    return this.noteDuration;
  }

  getNoteCount() {
    return this.noteCount;
  }
}

class Note {
  constructor(pitch, start, duration, octave, bar) {
    this.pitch = pitch;
    this.start = start;
    this.octave = octave;
    this.duration = duration;
    this.bar = bar;
    this.sound = new Audio();
  }

  changePitch(newPitch) {
    this.pitch = newPitch;
  }

  changeTimeValue(newValue) {
    this.bar._changeNoteTimeValue(this.start, newValue);
  }

  getDuration() {
    return this.duration;
  }

  getDurationValue() {
    return noteDurationToValue[this.duration];
  }
}

class Bar {
  constructor(maxDuration, index) {
    this.maxDuration = maxDuration;
    this.index = index;
    this.notes = [];
    this._iniitializeBar();
  }

  // get largest note duration that can fit into given bar duration
  _getLargestDuration(barDuration) {
    const durations = Object.keys(noteValueToDuration).reverse();
    let i = 0;
    while (durations[i] > barDuration) i++;
    return durations[i];
  }

  _iniitializeBar() {
    let durationLeft = this.maxDuration;
    while (durationLeft > 0) {
      const largestDuration = this._getLargestDuration(durationLeft);
      this.notes.push(
        new Note(null, 0, noteValueToDuration[largestDuration], null, this)
      );
      durationLeft -= largestDuration;
    }
  }

  _getNoteIndex(start) {
    return this.notes.findIndex(({ start: noteStart }) => noteStart == start);
  }

  // Splits the note that starts at start in the bar and
  // populate the duration with as many newValue notes as possible.
  // Fill in the remaining duration with appropriate note durations.
  // Precondition: curDuration > newDuration
  _splitNoteDuration(noteIndex, curDuration, newDuration) {
    let start = this.notes[noteIndex].start;
    const pitch = this.notes[noteIndex].pitch;
    const octave = this.notes[noteIndex].octave;
    const remainingDuration = curDuration % newDuration;
    const count = Math.floor(curDuration / newDuration);

    // keep notes from before note at noteIndex
    const prevNotes = this.notes.slice(0, noteIndex);
    const laterNotes = this.notes.slice(noteIndex + 1);

    const newNotes = [];
    for (let i = 0; i < count; i++) {
      newNotes.push(
        new Note(null, start, noteValueToDuration[newDuration], null, this)
      );
      start += newDuration;
    }
    if (remainingDuration > 0) {
      newNotes.push(
        new Note(
          null,
          start,
          noteValueToDuration[remainingDuration],
          null,
          this
        )
      );
    }

    this.notes = prevNotes.concat(newNotes).concat(laterNotes);
    this.notes[noteIndex].pitch = pitch;
    this.notes[noteIndex].octave = octave;
  }

  // Precondition: curDuration < newDuration &&
  // 							 this.notes[noteIndex].start + newDuration <= this.maxDuration
  _increaseNoteDuration(noteIndex, newDuration) {
    let endNoteIndex = noteIndex;
    let start = this.notes[noteIndex].start;
    const pitch = this.notes[noteIndex].pitch;
    const octave = this.notes[noteIndex].octave;
    let sum = 0;
    while (sum < newDuration) {
      sum += noteDurationToValue[this.notes[endNoteIndex].duration];
      endNoteIndex++;
    }

    const prevNotes = this.notes.slice(0, noteIndex);
    const laterNotes = this.notes.slice(endNoteIndex);
    const newNotes = [];

    newNotes.push(
      new Note(null, start, noteValueToDuration[newDuration], null, this)
    );
    start += newDuration;

    if (sum > newDuration) {
      newNotes.push(
        new Note(
          null,
          start,
          noteValueToDuration[sum - newDuration],
          null,
          this
        )
      );
    }

    this.notes = prevNotes.concat(newNotes).concat(laterNotes);
    this.notes[noteIndex].pitch = pitch;
    this.notes[noteIndex].octave = octave;
  }

  _changeNoteTimeValue(start, newValue) {
    const noteIndex = this._getNoteIndex(start);
    const curDuration = noteDurationToValue[this.notes[noteIndex].duration];
    const newDuration = noteDurationToValue[newValue];
    if (curDuration == newDuration) return;
    else if (curDuration > newDuration) {
      this._splitNoteDuration(noteIndex, curDuration, newDuration);
    } else {
      this._increaseNoteDuration(noteIndex, newDuration);
    }
  }

  getNote(noteIndex) {
    return this.notes[noteIndex];
  }
}

// Helper function that creates image elements with set up
function img_create(src, alt, title) {
  var img = document.createElement("img");
  img.src = src;
  if (alt != null) img.alt = alt;
  if (title != null) img.title = title;
  return img;
}

function Notify() {
  this.edtable;
  this.mainArea;
  this.staff;
  this.staffRows = [];

  this.playbackSpeed = 15000 / 120;

  this.selectedNote;
  this.selectedNote_i;
  this.selectedNote_bar_i;
  this.currentHighlightedNote;
  this.currentSelectedNotePitch;
  this.currentSelectedNoteTimeValue;
}

Notify.prototype = {
  // Create a staff with clef, beat duration (QUARTER, HALF), and beat count
  // (number of beats in a bar)
  createStaff: function (clef, noteDuration, noteCount, editable = true) {
    this.editable = editable;
    this.mainArea = document.createElement("div");
    this.mainArea.setAttribute("id", "notifyDrawArea");

    this.staff = new Staff(clef, noteDuration, noteCount);
    editable && this.createUI();
    this.drawStaff();
    return this.mainArea;
  },

  // Get the main DOM element of this staff
  getStaffElement: function () {
    return this.mainArea;
  },

  getSelectedNote: function () {
    return [this.selectedNote.duration, this.selectedNote.pitch];
  },

  // Get all the notes in the staff in a simple array
  getAllNotes: function () {
    const out = [];
    for (let i = 0; i < this.staff.bars.length; i++) {
      const bar = this.staff.bars[i];
      const barOut = [];
      for (let j = 0; j < bar.notes.length; j++) {
        const note = bar.notes[j];
        barOut.push([note.duration, note.pitch === null ? "rest" : note.pitch]);
      }
      out.push(barOut);
    }
    return out;
  },

  // Get the staff object that contains information about the staff,
  // bars, and notes
  getStaffObject: function () {
    return this.staff;
  },

  // Change pitch of the note at barIndex, noteIndex to newPitch
  changeNotePitch: function (barIndex, noteIndex, newPitch, responsive) {
    const rowIndex = Math.floor(barIndex / BARSPERROW);
    const bar = this.staff.getBar(barIndex);
    bar.getNote(noteIndex).changePitch(newPitch);
    this.updateBarDiv(rowIndex, bar);
    if (responsive) {
      this.playNote(barIndex, noteIndex);
      this.highlightNote(rowIndex, barIndex % BARSPERROW, noteIndex);
    }
  },

  // Change time value of the note at barIndex, noteIndex to newValue
  changeNoteTimeValue: function (barIndex, noteIndex, newValue) {
    const rowIndex = Math.floor(barIndex / BARSPERROW);
    const bar = this.staff.getBar(barIndex);
    bar.getNote(noteIndex).changeTimeValue(newValue);
    this.updateBarDiv(rowIndex, bar);
    this.selectedNote = this.staff.getBar(barIndex).getNote(noteIndex);
    this.selectedNote_bar_i = barIndex;
    this.selectedNote_i = noteIndex;
    this.highlightNote(rowIndex, barIndex % BARSPERROW, noteIndex);
  },

  // Change the play back speed in BPM
  changePlayBackSpeed: function (newSpeed) {
    this.playbackSpeed = 15000 / newSpeed;
  },

  changeTimeSignature: function (noteDuration, noteCount) {
    // Update data
    this.staff.changeTimeSignature(noteDuration, noteCount);

    // UI update: delete current notify staff and remake it
    this.mainArea.querySelector("#notifyStaff").outerHTML = "";
    this.drawStaff();
  },

  // Add bar at the end of staff
  addBar: function () {
    this.staff.addBar();
    this.addBarDiv(this.staff.bars[this.staff.bars.length - 1]);
  },

  // Remove last bar in the staff
  removeBar: function () {
    this.staff.removeBar();
    this.removeBarDiv();
  },

  playNote: function (barIndex, noteIndex) {
    const note = this.staff.getBar(barIndex).getNote(noteIndex);
    if (note.pitch) {
      const audio = new Audio(`notes/${note.pitch.toLowerCase()}.mp3`);
      audio.play();
    }
  },

  playBar: function (barIndex, offset = 0) {
    const bar = this.staff.getBar(barIndex);
    let timer = offset;
    let reversednoteDuration = Object.keys(noteDurationToValue);
    reversednoteDuration.reverse();
    for (let i = 0; i < bar.notes.length; i++) {
      let note = bar.getNote(i);
      setTimeout(() => {
        this.highlightNote(
          Math.floor(barIndex / BARSPERROW),
          barIndex % BARSPERROW,
          i
        );
        note.pitch &&
          this.selectNotePitchUI(
            Array.prototype.indexOf.call(
              Object.keys(pitchTailDirection),
              note.pitch
            )
          );
        this.selectNoteTimeValueUI(
          Array.prototype.indexOf.call(reversednoteDuration, note.duration)
        );
        note.pitch && this.playNote(barIndex, i);
        note = bar.getNote(i);
      }, timer);
      timer += this.playbackSpeed * noteDurationToValue[note.duration];
    }
  },

  playStaff: function () {
    for (let i = 0; i < this.staff.bars.length; i++) {
      this.playBar(
        i,
        i *
          this.staff.noteCount *
          this.playbackSpeed *
          this.staff.noteDurationValue
      );
    }
  },

  // ======== HELPER FUNCTIONS ===========
  highlightNote: function (rowIndex, barIndex, noteIndex) {
    this.currentHighlightedNote &&
      this.currentHighlightedNote.classList.remove("selected");
    let staffDiv = this.mainArea.querySelector("#notifyStaff");
    let UI = staffDiv.children[rowIndex].querySelector(".bars");
    let note = UI.children[barIndex].children[noteIndex];

    note.classList.add("selected");
    this.currentHighlightedNote = note;
  },

  selectNoteTimeValueUI: function (i) {
    this.currentSelectedNoteTimeValue &&
      this.currentSelectedNoteTimeValue.classList.remove("selected");
    let UI = this.mainArea.querySelector("#timeValueUI");
    this.currentSelectedNoteTimeValue = UI.children[i];
    this.currentSelectedNoteTimeValue.classList.add("selected");
  },

  selectNotePitchUI: function (i) {
    this.currentSelectedNotePitch &&
      this.currentSelectedNotePitch.classList.remove("selected");
    UI = this.mainArea.querySelector("#pitchUI");
    this.currentSelectedNotePitch = UI.children[i];
    this.currentSelectedNotePitch.classList.add("selected");
  },

  createUI: function () {
    const UIDiv = document.createElement("div");
    UIDiv.setAttribute("id", "notifyUI");
    UIDiv.appendChild(this.createTimeValueUI());
    UIDiv.appendChild(this.createPitchUI());
    UIDiv.appendChild(this.createBarUI());
    UIDiv.appendChild(this.createPlaybackUI());
    UIDiv.appendChild(this.createTimeSignatureUI());
    this.mainArea.appendChild(UIDiv);
  },

  createTimeSignatureUI: function () {
    const div = document.createElement("div");
    div.setAttribute("id", "timeSignatureUI");

    const noteDurationEL = document.createElement("select");
    noteDurationEL.setAttribute("id", "noteDurationPicker");
    const noteCountEL = document.createElement("select");
    noteCountEL.setAttribute("id", "noteCountPicker");

    const noteDurations = ["EIGHTH", "QUARTER", "HALF", "WHOLE"];
    const noteCounts = [2, 3, 4, 8, 9, 12];

    for (let i = 0; i < noteDurations.length; i++) {
      const newOption = document.createElement("option");
      newOption.innerHTML = noteDurations[i];
      noteDurationEL.appendChild(newOption);
      if (noteDurations[i] === this.staff.noteDuration) {
        noteDurationEL.selectedIndex = i;
      }
    }

    for (let i = 0; i < noteCounts.length; i++) {
      const newOption = document.createElement("option");
      newOption.innerHTML = noteCounts[i];
      noteCountEL.appendChild(newOption);
      if (noteCounts[i] === this.staff.noteCount) {
        noteCountEL.selectedIndex = i;
      }
    }

    const submitButton = document.createElement("button");
    submitButton.innerHTML = "Change time signature";
    submitButton.onclick = () => {
      this.changeTimeSignature(
        noteDurations[noteDurationEL.selectedIndex],
        noteCounts[noteCountEL.selectedIndex]
      );
    };

    const heading1 = document.createElement("h4");
    const heading2 = document.createElement("h4");
    heading1.innerText = "Note Count";
    heading2.innerText = "Note Duration";
    div.appendChild(heading1);
    div.appendChild(noteCountEL);
    div.appendChild(heading2);
    div.appendChild(noteDurationEL);
    div.appendChild(submitButton);

    return div;
  },

  createPlaybackUI: function () {
    const div = document.createElement("div");
    div.setAttribute("id", "playbackUI");
    const playButton = document.createElement("button");
    playButton.innerHTML = "Play from start";
    playButton.onclick = () => this.playStaff();

    const speedDiv = document.createElement("div");
    speedDiv.setAttribute("id", "playbackUITopRow");
    const img = img_create(tailUpNoteToImg["QUARTER"]);
    const speedInput = document.createElement("input");
    const speedSubmitButton = document.createElement("button");
    speedInput.value = "120";
    speedSubmitButton.innerHTML = "Change speed";
    speedSubmitButton.onclick = () =>
      this.changePlayBackSpeed(speedInput.value);
    img.setAttribute("id", "playbackUINote");
    const equalSign = document.createElement("p");
    equalSign.innerText = "=";

    speedDiv.appendChild(img);
    speedDiv.appendChild(equalSign);
    speedDiv.appendChild(speedInput);
    speedDiv.appendChild(speedSubmitButton);

    div.appendChild(speedDiv);
    div.appendChild(playButton);
    return div;
  },

  createBarUI: function () {
    const div = document.createElement("div");
    const addBarButton = document.createElement("button");
    const removeBarButton = document.createElement("button");
    addBarButton.innerHTML = "Add bar";
    removeBarButton.innerHTML = "Remove bar";
    addBarButton.onclick = () => this.addBar();
    removeBarButton.onclick = () => this.removeBar();
    div.appendChild(addBarButton);
    div.appendChild(removeBarButton);
    div.setAttribute("id", "barUI");
    return div;
  },
  createPitchUI: function () {
    const div = document.createElement("div");
    div.setAttribute("id", "pitchUI");
    const pitchValues = Object.keys(pitchTailDirection).concat(["X"]);
    for (let i = 0; i < pitchValues.length; i++) {
      const h3 = document.createElement("h3");
      h3.innerText = pitchValues[i];
      const link = document.createElement("a");
      link.onclick = (e) => this.updateNotePitch(e);
      link.appendChild(h3);
      div.appendChild(link);
    }
    return div;
  },

  createTimeValueUI: function () {
    const div = document.createElement("div");
    div.setAttribute("id", "timeValueUI");
    const timeValues = Object.values(tailUpNoteToImg).reverse();
    for (let i = 0; i < timeValues.length; i++) {
      const img = img_create(timeValues[i]);
      const imgContainer = document.createElement("div");
      const link = document.createElement("a");
      link.onclick = (e) => this.updateNoteValue(e);
      img.classList.add("timeValueUIImg");
      imgContainer.classList.add("timeValueUIItem");
      imgContainer.appendChild(img);
      link.appendChild(imgContainer);
      div.appendChild(link);
    }

    return div;
  },

  drawStaff: function () {
    const staffDiv = document.createElement("div");
    staffDiv.setAttribute("id", "notifyStaff");
    this.mainArea.appendChild(staffDiv);
    this.addStaffRowDiv(true);
    this.addBar();
  },

  addStaffRowDiv: function (firstRow = false) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("staffRow");
    const staffImg = img_create("res/staff.png", "staff");
    staffImg.setAttribute("id", "notifyStaffImg");

    // add clef to staff
    let clef;
    if ((this.staff.clef = "TREBLE")) {
      clef = img_create("res/treble-clef.png", "treble-clef");
    }
    clef.classList.add("treble-clef");
    rowDiv.appendChild(staffImg);
    rowDiv.appendChild(clef);

    // add bars div where bars are placed
    const barsDiv = document.createElement("div");
    barsDiv.classList.add("bars");
    rowDiv.appendChild(barsDiv);

    if (firstRow) {
      const botNum = img_create(
        numToNumImg[
          MAXIMUMTIMEVALUE / noteDurationToValue[this.staff.getNoteDuration()]
        ]
      );
      botNum.setAttribute("id", "bottomTimeSigNum");
      const topNum = img_create(numToNumImg[this.staff.getNoteCount()]);
      topNum.setAttribute("id", "topTimeSigNum");
      rowDiv.appendChild(topNum);
      rowDiv.appendChild(botNum);
    }

    const staffDiv = this.mainArea.querySelector("#notifyStaff");
    staffDiv.appendChild(rowDiv);
  },

  addBarDiv: function (bar) {
    const staffDiv = this.mainArea.querySelector("#notifyStaff");
    let lastRow = staffDiv.children[staffDiv.children.length - 1];
    let barsDiv = lastRow.querySelector(".bars");

    if (barsDiv.children.length === 3) {
      this.addStaffRowDiv(false);
      lastRow = staffDiv.children[staffDiv.children.length - 1];
      barsDiv = lastRow.querySelector(".bars");
    }

    const barDiv = document.createElement("div");
    barDiv.classList.add("bar");
    barsDiv.appendChild(barDiv);
    bar.notes.map((note) => {
      const noteDiv = this.drawNote(note);
      barDiv.appendChild(noteDiv);
    });
  },

  removeBarDiv: function () {
    const staffDiv = this.mainArea.querySelector("#notifyStaff");
    const barsDiv =
      staffDiv.children[staffDiv.children.length - 1].querySelector(".bars");
    barsDiv.removeChild(barsDiv.lastChild);
    if (barsDiv.children.length === 0 && staffDiv.children.length > 1) {
      staffDiv.removeChild(staffDiv.lastChild);
    }
  },
  updateBarDiv: function (rowIndex, bar) {
    const staffDiv = this.mainArea.querySelector("#notifyStaff");
    const barsDiv = staffDiv.children[rowIndex].querySelector(".bars");
    const barDiv = barsDiv.children[bar.index % BARSPERROW];
    while (barDiv.firstChild) {
      barDiv.removeChild(barDiv.lastChild);
    }
    bar.notes.map((note) => {
      const noteDiv = this.drawNote(note);
      barDiv.appendChild(noteDiv);
    });
  },
  drawNote: function (note) {
    const noteDiv = document.createElement("a");
    noteDiv.onclick = (e) => this.selectNoteEvent(e);
    noteDiv.classList.add("note");
    if (note.pitch === null) {
      const noteImg = img_create(restToImg[note.duration], "rest");
      noteImg.classList.add(note.duration + "REST");
      noteDiv.appendChild(noteImg);
    } else {
      const tailDir = pitchTailDirection[note.pitch];
      const noteImg = img_create(
        tailDir === "TAILUP"
          ? tailUpNoteToImg[note.duration]
          : tailDownNoteToImg[note.duration],
        "note"
      );
      noteImg.classList.add(note.duration);
      if (note.duration === "WHOLE" && tailDir === "TAILUP") {
        noteImg.classList.add("WHOLE-" + note.pitch);
      } else {
        noteImg.classList.add("pitch-" + note.pitch);
      }
      noteDiv.appendChild(noteImg);
    }
    return noteDiv;
  },
  selectNoteEvent: function (e) {
    const target = e.target.tagName === "IMG" ? e.target : e.target.firstChild;
    const note_i = Array.prototype.indexOf.call(
      target.parentNode.parentNode.children,
      target.parentNode
    );
    let bar_i = Array.prototype.indexOf.call(
      target.parentNode.parentNode.parentNode.children,
      target.parentNode.parentNode
    );
    const row_i = Array.prototype.indexOf.call(
      target.parentNode.parentNode.parentNode.parentNode.parentNode.children,
      target.parentNode.parentNode.parentNode.parentNode
    );

    bar_i = row_i * BARSPERROW + bar_i;

    const note = this.staff.getBar(bar_i).getNote(note_i);
    note.pitch && this.playNote(bar_i, note_i);

    const timeValues = Object.keys(tailUpNoteToImg).reverse();
    let UI_i = Array.prototype.indexOf.call(timeValues, note.duration);

    this.selectedNote = note;
    this.selectedNote_i = note_i;
    this.selectedNote_bar_i = bar_i;

    this.highlightNote(row_i, bar_i % BARSPERROW, note_i);
    this.editable && this.selectNoteTimeValueUI(UI_i);

    const pitchValues = Object.keys(pitchTailDirection);

    if (!note.pitch) {
      UI_i = pitchValues.length;
    } else {
      UI_i = Array.prototype.indexOf.call(pitchValues, note.pitch);
    }

    this.editable && this.selectNotePitchUI(UI_i);
  },

  updateNotePitch: function (e) {
    const target = e.target.tagName === "H3" ? e.target : e.target.firstChild;
    const i = Array.prototype.indexOf.call(
      target.parentNode.parentNode.children,
      target.parentNode
    );
    const pitchValues = Object.keys(pitchTailDirection);
    if (i === pitchValues.length) {
      this.selectedNote &&
        this.changeNotePitch(
          this.selectedNote_bar_i % BARSPERROW,
          this.selectedNote_i,
          null,
          true
        );
    } else {
      this.selectedNote &&
        this.changeNotePitch(
          this.selectedNote_bar_i,
          this.selectedNote_i,
          pitchValues[i],
          true
        );
    }

    this.selectNotePitchUI(i);
  },
  updateNoteValue: function (e) {
    const i = Array.prototype.indexOf.call(
      e.target.parentNode.parentNode.parentNode.children,
      e.target.parentNode.parentNode
    );
    const timeValues = Object.keys(tailUpNoteToImg).reverse();
    this.selectedNote &&
      this.changeNoteTimeValue(
        this.selectedNote_bar_i,
        this.selectedNote_i,
        timeValues[i]
      );

    this.selectNoteTimeValueUI(i);
  },
};
