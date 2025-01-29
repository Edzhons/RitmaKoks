from tkinter import *
from tkinter import ttk
import os
import sys

horiz = 0.03
vert = 0.15
skaits = 0
maxSkaits = 16

horiz2 = 0.03
vert2 = 0.15
skaits2 = 0
maxSkaits2 = 16

def resource_path(relative_path):
    if getattr(sys, 'frozen', False):  # Running as a bundled executable
        base_path = sys._MEIPASS  # Temporary folder where PyInstaller unpacks files
    else:
        base_path = os.path.abspath(".")  # Running as a script

    return os.path.join(base_path, relative_path)

def irLodzinsKoordinates(container, relx, rely):
    # Get the container's dimensions
    container.update_idletasks()  # Ensure dimensions are up to date
    container_width = container.winfo_width()
    container_height = container.winfo_height()

    # Convert relative to absolute pixel coordinates
    x = container_width * relx
    y = container_height * rely

    tolerance = 5  # Allowable deviation in pixels

    # Check if there's a widget at these pixel coordinates (with tolerance)
    for widget in container.winfo_children():
        widget_x = widget.winfo_x()
        widget_y = widget.winfo_y()

        # Compare with tolerance
        if abs(widget_x - x) <= tolerance and abs(widget_y - y) <= tolerance:
            return True  # Widget exists
    return False

def PievienoBildi(frame,bilde, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2):
    global horiz, vert, skaits, maxSkaits,  horiz2, vert2, skaits2, maxSkaits2
    if frame == zimejumi:
        if skaits < maxSkaits:
            plaukstas = Label(frame,image=bilde,bg="#222222",relief=RIDGE,bd=1)
            plaukstas.place(relx=horiz,rely=vert,relwidth=0.119, relheight=0.212)
            if not irLodzinsKoordinates(frame, horiz, vert+0.22) and not bilde == pauzeImg:
                ievade = Entry(frame, font=("Arial",24), width=11,justify="center",bg="#222222",fg="gold")
                ievade.place(relx=horiz, rely=vert+0.22,relwidth=0.118,relheight=0.043)
            horiz += 0.118
            if horiz >= 0.974:
                horiz = 0.03
                vert = 0.45
                pogaEnter["state"] = "disabled"
            skaits += 1
            if skaits == 1:
                pogaEnter["state"] = "active"
    else:
        if skaits2 < maxSkaits2:
            plaukstas = Label(frame,image=bilde,bg="#222222",relief=RIDGE,bd=1)
            plaukstas.place(relx=horiz2,rely=vert2,relwidth=0.119, relheight=0.212)
            if not irLodzinsKoordinates(frame, horiz2, vert2+0.22) and not bilde == pauze2Img:
                ievade = Entry(frame, font=("Arial",24), width=11,justify="center",bg="#222222",fg="gold")
                ievade.place(relx=horiz2, rely=vert2+0.22,relwidth=0.118,relheight=0.043)
            horiz2 += 0.118
            if horiz2 >= 0.974:
                horiz2 = 0.03
                vert2 = 0.45
                pogaEnter2["state"] = "disabled"
            skaits2 += 1
            if skaits2 == 1:
                pogaEnter2["state"] = "active"

def ResetBildes(frame, zimejumi, virsraksts, pogaEnter, pogaEnter2, virsraksts2):
    global horiz, vert, skaits, maxSkaits,  horiz2, vert2, skaits2, maxSkaits2

    if frame == zimejumi:
        horiz = 0.03
        vert = 0.15
        skaits = 0
        maxSkaits = 16

        for widget in frame.winfo_children():
            if isinstance(widget, Label) and widget not in(virsraksts,):
                widget.destroy()

        pogaEnter["state"] = "disabled"
    else:
        horiz2 = 0.03
        vert2 = 0.15
        skaits2 = 0
        maxSkaits2 = 16

        for widget in frame.winfo_children():
            if isinstance(widget, Label) and widget not in(virsraksts2,):
                widget.destroy()

        pogaEnter2["state"] = "disabled"

def Reset(frame, zimejumi, virsraksts, virsraksts2, pogaEnter, pogaEnter2):
    global horiz, vert, skaits, maxSkaits,  horiz2, vert2, skaits2, maxSkaits2

    if frame == zimejumi:
        horiz = 0.03
        vert = 0.15
        skaits = 0
        maxSkaits = 16

        for widget in frame.winfo_children():
            if isinstance(widget, Label) and widget not in(virsraksts,):
                widget.destroy()
            elif isinstance(widget, Entry):
                    widget.destroy()

        pogaEnter["state"] = "disabled"
    else:
        horiz2 = 0.03
        vert2 = 0.15
        skaits2 = 0
        maxSkaits2 = 16

        for widget in frame.winfo_children():
            if isinstance(widget, Label) and widget not in(virsraksts2,):
                widget.destroy()
            elif isinstance(widget, Entry):
                    widget.destroy()

        pogaEnter2["state"] = "disabled"

def Enter(frame, zimejumi, pogaEnter, pogaEnter2):
    global horiz, vert, maxSkaits,  horiz2, vert2, maxSkaits2
    
    if frame == zimejumi:
        horiz = 0.03
        vert = 0.45
        maxSkaits = skaits*2
        pogaEnter["state"] = "disabled"
    else:
        horiz2 = 0.03
        vert2 = 0.45
        maxSkaits2 = skaits2*2
        pogaEnter2["state"] = "disabled"

def mainitFrame(index, notebook, btn_zimejumi, btn_instrumenti):

    notebook.select(index)

    if index == 0:  # Zimejumu frame
        btn_zimejumi.config(bg="yellow", relief="sunken")
        btn_instrumenti.config(bg="#00FF00", relief="raised")
    else:  # Instrumentu frame
        btn_zimejumi.config(bg="#00FF00", relief="raised")
        btn_instrumenti.config(bg="yellow", relief="sunken")

def aizvertProgrammu(galvenais):
    galvenais.destroy()

isFullscreen = True
def toggleFullscreen(galvenais):
    global isFullscreen
    
    if isFullscreen:
        galvenais.attributes("-fullscreen", False)
        isFullscreen = False
    else:
        galvenais.attributes("-fullscreen", True)
        isFullscreen = True