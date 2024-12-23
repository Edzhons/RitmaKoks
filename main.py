from tkinter import *
from tkinter import ttk

horiz = 50
vert = 100
skaits = 0
maxSkaits = 16

horiz2 = 50
vert2 = 100
skaits2 = 0
maxSkaits2 = 16

def irLodzinsKoordinates(container, x, y):
    #Pārbauda, vai zem bildes jau ir Entry lodziņš
    for widget in container.winfo_children():
        # Tagadējās widget koordinātas
        widget_x = widget.winfo_x()
        widget_y = widget.winfo_y()
        if widget_x == x and widget_y == y:
            return True  # Lodziņš eksistē
    return False

def PievienoBildi(frame,bilde):
    global horiz, vert, skaits, maxSkaits,  horiz2, vert2, skaits2, maxSkaits2
    if frame == zimejumi:
        if skaits != maxSkaits:
            plaukstas = Label(frame,image=bilde,bg="#222222",relief=RIDGE,bd=1)
            plaukstas.place(x=horiz,y=vert)
            if not irLodzinsKoordinates(frame, horiz, vert+220) and not bilde == pauzeImg:
                ievade = Entry(frame, font=("Arial",24), width=11,justify="center",bg="#222222",fg="gold")
                ievade.place(x=horiz, y=vert+220)
            horiz += 200
            if horiz == 1650:
                horiz = 50
                vert = 375
                pogaEnter["state"] = "disabled"
            skaits += 1
    else:
        if skaits2 != maxSkaits2:
            plaukstas = Label(frame,image=bilde,bg="#222222",relief=RIDGE,bd=1)
            plaukstas.place(x=horiz2,y=vert2)
            if not irLodzinsKoordinates(frame, horiz2, vert2+220) and not bilde == pauze2Img:
                ievade = Entry(frame, font=("Arial",24), width=11,justify="center",bg="#222222",fg="gold")
                ievade.place(x=horiz2, y=vert2+220)
            horiz2 += 200
            if horiz2 == 1650:
                horiz2 = 50
                vert2 = 375
                pogaEnter2["state"] = "disabled"
            skaits2 += 1

def ResetBildes(frame):
    global horiz, vert, skaits, maxSkaits,  horiz2, vert2, skaits2, maxSkaits2

    if frame == zimejumi:
        horiz = 50
        vert = 100
        skaits = 0
        maxSkaits = 16

        for widget in frame.winfo_children():
            if isinstance(widget, Label) and widget not in(virsraksts,):
                widget.destroy()

        pogaEnter["state"] = "active"
    else:
        horiz2 = 50
        vert2 = 100
        skaits2 = 0
        maxSkaits2 = 16

        for widget in frame.winfo_children():
            if isinstance(widget, Label) and widget not in(virsraksts2,):
                widget.destroy()

        pogaEnter2["state"] = "active"

def Reset(frame):
    global horiz, vert, skaits, maxSkaits,  horiz2, vert2, skaits2, maxSkaits2

    if frame == zimejumi:
        horiz = 50
        vert = 100
        skaits = 0
        maxSkaits = 16

        for widget in frame.winfo_children():
            if isinstance(widget, Label) and widget not in(virsraksts,):
                widget.destroy()
            elif isinstance(widget, Entry):
                    widget.destroy()

        pogaEnter["state"] = "active"
    else:
        horiz2 = 50
        vert2 = 100
        skaits2 = 0
        maxSkaits2 = 16

        for widget in frame.winfo_children():
            if isinstance(widget, Label) and widget not in(virsraksts2,):
                widget.destroy()
            elif isinstance(widget, Entry):
                    widget.destroy()

        pogaEnter2["state"] = "active"

def Enter(frame):
    global horiz, vert, maxSkaits,  horiz2, vert2, maxSkaits2
    
    if frame == zimejumi:
        vert = 375
        horiz = 50
        maxSkaits = skaits*2
        pogaEnter["state"] = "disabled"
    else:
        vert2 = 375
        horiz2 = 50
        maxSkaits2 = skaits2*2
        pogaEnter2["state"] = "disabled"

#GALVENAIS WINDOW
galvenais = Tk()

notebook = ttk.Notebook(galvenais)

zimejumi = Frame(notebook,bg="#222222")
notis = Frame(notebook,bg="#222222")

notebook.add(zimejumi,text="Zimejumi")
notebook.add(notis,text="Notis")
notebook.pack(expand=True,fill="both")

#BILDES
plaukstasImg = PhotoImage(file='bildes\\plaukstas.png')
plaukstasx2Img = PhotoImage(file='bildes\\plaukstasx2.png')
kajasImg = PhotoImage(file='bildes\\kajas.png')
kajasx2Img = PhotoImage(file='bildes\\kajasx2.png')
knipisImg = PhotoImage(file='bildes\\knipis.png')
plaukstasKajasImg = PhotoImage(file='bildes\\plaukstasKajas.png')
plaukstasKajasx2Img = PhotoImage(file='bildes\\plaukstasKajasx2.png')
pauzeImg = PhotoImage(file='bildes\\pauze.png')

plaukstasPogaImg = PhotoImage(file='bildes\\plaukstasPoga.png')
plaukstasx2PogaImg = PhotoImage(file='bildes\\plaukstasx2Poga.png')
kajasPogaImg = PhotoImage(file='bildes\\kajasPoga.png')
kajasPogax2Img = PhotoImage(file='bildes\\kajasx2Poga.png')
knipisPogaImg = PhotoImage(file='bildes\\knipisPoga.png')
plaukstasKajasPogaImg = PhotoImage(file='bildes\\plaukstasKajasPoga.png')
plaukstasKajasx2PogaImg = PhotoImage(file='bildes\\plaukstasKajasx2Poga.png')
pauzePogaImg = PhotoImage(file='bildes\\pauzePoga.png')
resetBildesPogaImg = PhotoImage(file='bildes\\resetBildesPoga.png')
resetPogaImg = PhotoImage(file='bildes\\resetPoga.png')
enterPogaImg = PhotoImage(file='bildes\\enterPoga.png')

width= galvenais.winfo_screenwidth() 
height= galvenais.winfo_screenheight()

galvenais.geometry("%dx%d" % (width, height))

galvenais.title("Ritma Koks")
ikona = PhotoImage(file='bildes\\ritmaKoks_logo.png')
galvenais.iconphoto(True,ikona)
galvenais.config(background="#222222")

virsraksts = Label(zimejumi,
                   text="Ritma Koks",
                   font=('Arial',30,'bold'),
                   fg='blue',
                   bg='#00FF00',
                   relief=RAISED,
                   bd=20,)
virsraksts.pack()

#Pogas
#simboli
pogaPlaukstas = Button(zimejumi,
              image=plaukstasPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(zimejumi,plaukstasImg))
pogaPlaukstas.place(x=50,y=750)

pogaPlaukstasx2 = Button(zimejumi,
              image=plaukstasx2PogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(zimejumi,plaukstasx2Img))
pogaPlaukstasx2.place(x=200,y=750)

pogaKajas = Button(zimejumi,
              image=kajasPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(zimejumi,kajasImg))
pogaKajas.place(x=350,y=750)

pogaKajasx2 = Button(zimejumi,
              image=kajasPogax2Img,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(zimejumi,kajasx2Img))
pogaKajasx2.place(x=500,y=750)

pogaKnipis = Button(zimejumi,
              image=knipisPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(zimejumi,knipisImg))
pogaKnipis.place(x=650,y=750)

pogaPlaukstasKajas = Button(zimejumi,
              image=plaukstasKajasPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(zimejumi,plaukstasKajasImg))
pogaPlaukstasKajas.place(x=800,y=750)

pogaPlaukstasKajasx2 = Button(zimejumi,
              image=plaukstasKajasx2PogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(zimejumi,plaukstasKajasx2Img))
pogaPlaukstasKajasx2.place(x=950,y=750)

pogaPauze = Button(zimejumi,
              image=pauzePogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(zimejumi,pauzeImg))
pogaPauze.place(x=1100,y=750)

#iestatijumi
pogaBildesReset = Button(zimejumi,
              image=resetBildesPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: ResetBildes(zimejumi))
pogaBildesReset.place(x=1400,y=750)

pogaReset = Button(zimejumi,
              image=resetPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: Reset(zimejumi))
pogaReset.place(x=1550,y=750)

pogaEnter = Button(zimejumi,
                   image=enterPogaImg,bg="#222222",activebackground="#222222",bd=0,
                   command=lambda: Enter(zimejumi))
pogaEnter.place(x=1100,y=0)


# NOTIS SADAĻA, 2. TABS
virsraksts2 = Label(notis,
                   text="Ritma Koks",
                   font=('Arial',30,'bold'),
                   fg='blue',
                   bg='#00FF00',
                   relief=RAISED,
                   bd=20,)
virsraksts2.pack()

#BILDES
veselaNotsImg = PhotoImage(file='bildes\\veselaNots.png')
pusnotsImg = PhotoImage(file='bildes\\pusnots.png')
ceturtdalnotsImg = PhotoImage(file='bildes\\ceturtdalnots.png')
astotdalnotsImg = PhotoImage(file='bildes\\astotdalnots.png')
sespadsmitdalnotsImg = PhotoImage(file='bildes\\sespadsmitdalnots.png')
pauze2Img = PhotoImage(file='bildes\\pauze2.png')

veselaNotsPogaImg = PhotoImage(file='bildes\\veselaNotsPoga.png')
pusnotsPogaImg = PhotoImage(file='bildes\\pusnotsPoga.png')
ceturtdalnotsPogaImg = PhotoImage(file='bildes\\ceturtdalnotsPoga.png')
astotdalnotsPogaImg = PhotoImage(file='bildes\\astotdalnotsPoga.png')
sespadsmitdalnotsPogaImg = PhotoImage(file='bildes\\sespadsmitdalnotsPoga.png')
pauze2PogaImg = PhotoImage(file='bildes\\pauze2Poga.png')
resetBildes2PogaImg = PhotoImage(file='bildes\\resetBildes2Poga.png')

#Pogas
#simboli
pogaVeselaNots = Button(notis,
              image=veselaNotsPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(notis,veselaNotsImg))
pogaVeselaNots.place(x=50,y=750)

pogaPusnots = Button(notis,
              image=pusnotsPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(notis,pusnotsImg))
pogaPusnots.place(x=200,y=750)

pogaCeturtdalnots = Button(notis,
              image=ceturtdalnotsPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(notis,ceturtdalnotsImg))
pogaCeturtdalnots.place(x=350,y=750)

pogaAstotdalnots = Button(notis,
              image=astotdalnotsPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(notis,astotdalnotsImg))
pogaAstotdalnots.place(x=500,y=750)

pogaSespadsmitdalnots = Button(notis,
              image=sespadsmitdalnotsPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(notis,sespadsmitdalnotsImg))
pogaSespadsmitdalnots.place(x=650,y=750)

pogaPauze2 = Button(notis,
              image=pauze2PogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: PievienoBildi(notis,pauze2Img))
pogaPauze2.place(x=900,y=750)

#iestatijumi
pogaBildesReset2 = Button(notis,
              image=resetBildes2PogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: ResetBildes(notis))
pogaBildesReset2.place(x=1400,y=750)

pogaReset2 = Button(notis,
              image=resetPogaImg,bg="#222222",activebackground="#222222",relief=RIDGE,bd=1,
              command=lambda: Reset(notis))
pogaReset2.place(x=1550,y=750)

pogaEnter2 = Button(notis,
                   image=enterPogaImg,bg="#222222",activebackground="#222222",bd=0,
                   command=lambda: Enter(notis))
pogaEnter2.place(x=1100,y=0)




galvenais.mainloop()