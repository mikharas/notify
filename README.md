# Example Page

https://noteify-2585418530f8.herokuapp.com

# Getting started

Notify is a library that can notate and play music easily on the web. To use the library, include the notify.css file in your html and also Notify.js as a script.

## Initializing a staff

Here is an example on how to initialize a staff.

```
const staff1 = new Notify(); 
const staffEl = staff1.createStaff("TREBLE", "QUARTER", 4); 
```
`staffEl` contains the html element of the staff. You can now put it in your application through `.appendChild(staffEl)`

## Adding/Changing/Deleting Notes

Once you create a staff, it will by default have one bar in the staff. Empty bars will be filled with rest notes. To "add" a note, you can modify the rest note through this API:

```
staff1.changeNoteTimeValue(0, 0, "QUARTER"); 
staff1.changeNotePitch(0, 0, "G4"); 
staff1.changeNotePitch(0, 0, null); 
```

"Deleting notes" would just be changing the note's pitch value to `null`

## Adding/removing bars

You can add and remove a bar from the end of the staff like this:

```
staff1.addBar(); 
staff1.removeBar(); 
```

## Getting data

To get data on the notes that have been added to the staff, use the following API:

```
staff1.getAllNotes(); 
staff1.getSelectedNote(); 
```

getSelectedNote will return the data of the currently selected note on the staff and getAllNotes will return the data of all of the notes.

## Playing Sound

To play the sound of a note/bar/staff, use the following API:

```
staff1.playNote(); 
staff1.playBar(0); 
staff1.playStaff(0); 
```

# Documentation

[Documentation of notify](https://noteify-2585418530f8.herokuapp.com/documentation.html)
