"use strict";

const staff1 = new Notify();
const staff2 = new Notify();

// create instance in 4 4 time
document
  .querySelector("#staff1")
  .appendChild(staff1.createStaff("TREBLE", "QUARTER", 4));

// create instance in 3 8 time
document
  .querySelector("#staff2")
  .appendChild(staff2.createStaff("TREBLE", "QUARTER", 4, false));

document.querySelector("#staff2button").onclick = () => {
	console.log(staff2.getAllNotes())
}

document.querySelector("#staff2getNote").onclick = () => {
	console.log(staff2.getSelectedNote())
}

staff1.changeNoteTimeValue(0, 0, "QUARTER")
staff1.changeNotePitch(0, 0, "G4")
staff1.changeNotePitch(0, 1, "G4")
staff1.changeNoteTimeValue(0, 2, "EIGHTH")
staff1.changeNotePitch(0, 2, "D5")
staff1.changeNotePitch(0, 3, "D5")
staff1.changeNotePitch(0, 4, "D5")
staff1.addBar()
staff1.changeNoteTimeValue(1, 0, "QUARTER")
staff1.changeNotePitch(1, 0, "E5")
staff1.changeNotePitch(1, 1, "E5")
staff1.changeNotePitch(1, 2, "D5")

staff2.changeNoteTimeValue(0, 0, "QUARTER")
staff2.changeNotePitch(0, 0, "G4")
staff2.changeNotePitch(0, 1, "G4")
staff2.changeNoteTimeValue(0, 2, "EIGHTH")
staff2.changeNotePitch(0, 2, "D5")
staff2.changeNotePitch(0, 3, "D5")
staff2.changeNotePitch(0, 4, "D5")
staff2.addBar()
staff2.changeNoteTimeValue(1, 0, "QUARTER")
staff2.changeNotePitch(1, 0, "E5")
staff2.changeNotePitch(1, 1, "E5")
staff2.changeNotePitch(1, 2, "D5")
