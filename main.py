from metodes import *

galvenais = Tk()

def aizvertProgrammu():
    galvenais.destroy()
#GALVENAIS WINDOW

notebook = ttk.Notebook(galvenais)

zimejumi = Frame(notebook,bg="#222222")
notis = Frame(notebook,bg="#222222")

notebook.add(zimejumi,text="Zimejumi")
notebook.add(notis,text="Instrumenti")
notebook.pack(expand=True,fill="both")

style = ttk.Style()
style.layout("TNotebook.Tab", [])

galvenais.attributes("-fullscreen", True)
width = galvenais.winfo_screenwidth() 
height = galvenais.winfo_screenheight()

galvenais.geometry("%dx%d" % (width, height))

galvenais.title("Ritma Koks")
galvenais.config(background="#222222")

# ikona = PhotoImage(file="images/ikona.ico")
# galvenais.iconphoto(True,ikona)

virsraksts = Label(zimejumi,
                   text="Ritma Koks",
                   font=('Arial',30,'bold'),
                   fg='blue',
                   bg='#00FF00',
                   relief=RAISED,
                   bd=20,)
virsraksts.pack()

#BILDES
plaukstasImg = PhotoImage(file=resource_path("images/plaukstas.png"))
plaukstasx2Img = PhotoImage(file=resource_path("images/plaukstasx2.png"))
kajasImg = PhotoImage(file=resource_path("images/kajas.png"))
kajasx2Img = PhotoImage(file=resource_path("images/kajasx2.png"))
knipisImg = PhotoImage(file=resource_path("images/knipis.png"))
plaukstasKajasImg = PhotoImage(file=resource_path("images/plaukstasKajas.png"))
plaukstasKajasx2Img = PhotoImage(file=resource_path("images/plaukstasKajasx2.png"))
pauzeImg = PhotoImage(file=resource_path("images/pauze.png"))

plaukstasPogaImg = PhotoImage(file=resource_path("images/plaukstasPoga.png"))
plaukstasx2PogaImg = PhotoImage(file=resource_path("images/plaukstasx2Poga.png"))
kajasPogaImg = PhotoImage(file=resource_path("images/kajasPoga.png"))
kajasPogax2Img = PhotoImage(file=resource_path("images/kajasx2Poga.png"))
knipisPogaImg = PhotoImage(file=resource_path("images/knipisPoga.png"))
plaukstasKajasPogaImg = PhotoImage(file=resource_path("images/plaukstasKajasPoga.png"))
plaukstasKajasx2PogaImg = PhotoImage(file=resource_path("images/plaukstasKajasx2Poga.png"))
pauzePogaImg = PhotoImage(file=resource_path("images/pauzePoga.png"))
resetBildesPogaImg = PhotoImage(file=resource_path("images/resetBildesPoga.png"))
resetPogaImg = PhotoImage(file=resource_path("images/resetPoga.png"))
enterPogaImg = PhotoImage(file=resource_path("images/enterPoga.png"))

#Pogas
pogaZimejumi = Button(zimejumi, text="Žesti",
                      font=('Arial',15,'bold'),fg='blue',bg='#00FF00',
                      activebackground="#00FF00",
                      activeforeground="blue",
                      relief=SUNKEN,bd=10, command=lambda: mainitFrame(0, notebook, btn_zimejumi, btn_instrumenti))
pogaZimejumi.place(relx=0.01,rely=0.01,relwidth=0.08,relheight=0.06)

pogaInstrumenti = Button(zimejumi, text="Instrumenti",
                        font=('Arial',15,'bold'),fg='blue',bg='#00FF00',
                        activebackground="#00FF00",
                        activeforeground="blue",
                        relief=RAISED,bd=10, command=lambda: mainitFrame(1, notebook, btn_zimejumi, btn_instrumenti))
pogaInstrumenti.place(relx=0.1,rely=0.01,relwidth=0.08,relheight=0.06)

pogaEnter = Button(zimejumi,
                   image=enterPogaImg,bg="#222222",activebackground="#222222",bd=0,
                   command=lambda: Enter(zimejumi, zimejumi, pogaEnter, pogaEnter2))
pogaEnter.place(relx=0.65,rely=0.01,relwidth=0.072, relheight=0.128)
pogaEnter["state"] = "disabled"

pogaAizvert = Button(galvenais, text="X",
                      font=('Arial',20,'bold'),fg='blue',bg='#00FF00',
                      activebackground="#00FF00",
                      activeforeground="blue",
                      relief=RAISED,bd=10, command=lambda: aizvertProgrammu())
pogaAizvert.place(relx=0.96,rely=0.01,relwidth=0.035,relheight=0.062)

#simboli
pogaPlaukstas = Button(zimejumi,
              image=plaukstasPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zimejumi,plaukstasImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaPlaukstas.place(relx=0.01,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPlaukstasx2 = Button(zimejumi,
              image=plaukstasx2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zimejumi,plaukstasx2Img, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaPlaukstasx2.place(relx=0.1,rely=0.85,relwidth=0.072, relheight=0.128)

pogaKajas = Button(zimejumi,
              image=kajasPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zimejumi,kajasImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaKajas.place(relx=0.19,rely=0.85,relwidth=0.072, relheight=0.128)

pogaKajasx2 = Button(zimejumi,
              image=kajasPogax2Img,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zimejumi,kajasx2Img, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaKajasx2.place(relx=0.28,rely=0.85,relwidth=0.072, relheight=0.128)

pogaKnipis = Button(zimejumi,
              image=knipisPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zimejumi,knipisImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaKnipis.place(relx=0.37,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPlaukstasKajas = Button(zimejumi,
              image=plaukstasKajasPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zimejumi,plaukstasKajasImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaPlaukstasKajas.place(relx=0.46,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPlaukstasKajasx2 = Button(zimejumi,
              image=plaukstasKajasx2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zimejumi,plaukstasKajasx2Img, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaPlaukstasKajasx2.place(relx=0.55,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPauze = Button(zimejumi,
              image=pauzePogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zimejumi,pauzeImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaPauze.place(relx=0.64,rely=0.85,relwidth=0.072, relheight=0.128)

#iestatijumi
pogaBildesReset = Button(zimejumi,
              image=resetBildesPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: ResetBildes(zimejumi, zimejumi, virsraksts, pogaEnter, pogaEnter2, virsraksts2))
pogaBildesReset.place(relx=0.83,rely=0.85,relwidth=0.072, relheight=0.128)

pogaReset = Button(zimejumi,
              image=resetPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: Reset(zimejumi, zimejumi, virsraksts, virsraksts2, pogaEnter, pogaEnter2))
pogaReset.place(relx=0.92,rely=0.85,relwidth=0.072, relheight=0.128)


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
plaukstas2Img = PhotoImage(file=resource_path("images/plaukstas.png"))
plaukstasx22Img = PhotoImage(file=resource_path("images/plaukstasx2.png"))
trijsturisImg = PhotoImage(file=resource_path("images/trijsturis.png"))
kociniImg = PhotoImage(file=resource_path("images/kocini.png"))
marakassImg = PhotoImage(file=resource_path("images/marakass.png"))
bungasImg = PhotoImage(file=resource_path("images/bungas.png"))
pauze2Img = PhotoImage(file=resource_path("images/pauze2.png"))

plaukstas2PogaImg = PhotoImage(file=resource_path("images/plaukstasPoga.png"))
plaukstasx22PogaImg = PhotoImage(file=resource_path("images/plaukstasx2Poga.png"))
trijsturisPogaImg = PhotoImage(file=resource_path("images/trijsturisPoga.png"))
kociniPogaImg = PhotoImage(file=resource_path("images/kociniPoga.png"))
marakassPogaImg = PhotoImage(file=resource_path("images/marakassPoga.png"))
bungasPogaImg = PhotoImage(file=resource_path("images/bungasPoga.png"))
pauze2PogaImg = PhotoImage(file=resource_path("images/pauze2Poga.png"))
resetBildes2PogaImg = PhotoImage(file=resource_path("images/resetBildes2Poga.png"))

#Pogas
#simboli
btn_zimejumi = Button(notis, text="Žesti",
                        font=('Arial',15,'bold'),fg='blue',bg='#00FF00',
                        activebackground="#00FF00",
                        activeforeground="blue",
                        relief=RAISED,bd=10, command=lambda: mainitFrame(0, notebook, btn_zimejumi, btn_instrumenti))
btn_zimejumi.place(relx=0.01,rely=0.01,relwidth=0.08,relheight=0.06)

btn_instrumenti = Button(notis, text="Instrumenti",
                        font=('Arial',15,'bold'),fg='blue',bg='#00FF00',
                        activebackground="#00FF00",
                        activeforeground="blue",
                        relief=SUNKEN,bd=10, command=lambda: mainitFrame(1, notebook, btn_zimejumi, btn_instrumenti))
btn_instrumenti.place(relx=0.1,rely=0.01,relwidth=0.08,relheight=0.06)

pogaEnter2 = Button(notis,
                   image=enterPogaImg,bg="#222222",activebackground="#222222",bd=0,
                   command=lambda: Enter(notis, zimejumi, pogaEnter, pogaEnter2))
pogaEnter2.place(relx=0.65,rely=0.01,relwidth=0.072, relheight=0.128)
pogaEnter2["state"] = "disabled"

pogaPlaukstas2 = Button(notis,
              image=plaukstas2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(notis,plaukstas2Img, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaPlaukstas2.place(relx=0.01,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPlaukstasx22 = Button(notis,
              image=plaukstasx22PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(notis,plaukstasx22Img, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaPlaukstasx22.place(relx=0.1,rely=0.85,relwidth=0.072, relheight=0.128)

pogaTrijsturis = Button(notis,
              image=trijsturisPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(notis,trijsturisImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaTrijsturis.place(relx=0.19,rely=0.85,relwidth=0.072, relheight=0.128)

pogaKocini = Button(notis,
              image=kociniPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(notis,kociniImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaKocini.place(relx=0.28,rely=0.85,relwidth=0.072, relheight=0.128)

pogaMarakass = Button(notis,
              image=marakassPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(notis,marakassImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaMarakass.place(relx=0.37,rely=0.85,relwidth=0.072, relheight=0.128)

pogaBungas = Button(notis,
              image=bungasPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(notis,bungasImg, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaBungas.place(relx=0.46,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPauze2 = Button(notis,
              image=pauze2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(notis,pauze2Img, zimejumi, pauzeImg, pauze2Img, pogaEnter, pogaEnter2))
pogaPauze2.place(relx=0.55,rely=0.85,relwidth=0.072, relheight=0.128)

#iestatijumi
pogaBildesReset2 = Button(notis,
              image=resetBildes2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: ResetBildes(notis, zimejumi, virsraksts, pogaEnter, pogaEnter2, virsraksts2))
pogaBildesReset2.place(relx=0.83,rely=0.85,relwidth=0.072, relheight=0.128)

pogaReset2 = Button(notis,
              image=resetPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: Reset(notis, zimejumi, virsraksts, virsraksts2, pogaEnter, pogaEnter2))
pogaReset2.place(relx=0.92,rely=0.85,relwidth=0.072, relheight=0.128)

galvenais.mainloop()