from metodes import *

galvenais = Tk()

notebook = ttk.Notebook(galvenais)

zesti = Frame(notebook,bg="#222222")
instrumenti = Frame(notebook,bg="#222222")

notebook.add(zesti,text="zesti")
notebook.add(instrumenti,text="Instrumenti")
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

virsraksts = Label(zesti,
                   text="Ritma Koks",
                   font=('Arial',30,'bold'),
                   fg='blue',
                   bg='#00FF00',
                   relief=RAISED,
                   bd=20,)
virsraksts.pack()

# BILDES
Img_BtnFullscreen = PhotoImage(file=resource_path("images/BtnFullscreen.png")).subsample(4,4)

plaukstasImg = PhotoImage(file=resource_path("images/plaukstas.png"))
plaukstasx2Img = PhotoImage(file=resource_path("images/plaukstasx2.png"))
kajasImg = PhotoImage(file=resource_path("images/kajas.png"))
kajasx2Img = PhotoImage(file=resource_path("images/kajasx2.png"))
knipisImg = PhotoImage(file=resource_path("images/knipis.png"))
plaukstasKajasImg = PhotoImage(file=resource_path("images/plaukstasKajas.png"))
plaukstasKajasx2Img = PhotoImage(file=resource_path("images/plaukstasKajasx2.png"))
pauzeImg = PhotoImage(file=resource_path("images/pauze.png"))

BackspacePogaImg = PhotoImage(file=resource_path("images/backspacePoga.png")).subsample(2,2)
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

# POGAS
pogaMinimize = Button(galvenais, text="-",
                      font=('Arial',50,'bold'),fg='blue',bg='#00FF00',
                      activebackground="#00FF00",
                      activeforeground="blue",
                      relief=RAISED,bd=10, command=lambda: galvenais.iconify())
pogaMinimize.place(relx=0.86,rely=0.01,relwidth=0.035,relheight=0.062)

pogaToggleFs = Button(galvenais, image=Img_BtnFullscreen,
                      fg='blue',bg='#00FF00',
                      activebackground="#00FF00",
                      activeforeground="blue",
                      relief=RAISED,bd=10, command=lambda: toggleFullscreen(galvenais))
pogaToggleFs.place(relx=0.91,rely=0.01,relwidth=0.035,relheight=0.062)

pogaAizvert = Button(galvenais, text="X",
                      font=('Arial',20,'bold'),fg='blue',bg='#00FF00',
                      activebackground="#00FF00",
                      activeforeground="blue",
                      relief=RAISED,bd=10, command=lambda: aizvertProgrammu(galvenais))
pogaAizvert.place(relx=0.96,rely=0.01,relwidth=0.035,relheight=0.062)


pogaZesti = Button(zesti, text="Žesti",
                      font=('Arial',15,'bold'),fg='blue',bg='#00FF00',
                      activebackground="#00FF00",
                      activeforeground="blue",
                      relief=SUNKEN,bd=10, command=lambda: mainitFrame(0, notebook, btn_zesti, btn_instrumenti))
pogaZesti.place(relx=0.01,rely=0.01,relwidth=0.08,relheight=0.06)

pogaInstrumenti = Button(zesti, text="Instrumenti",
                        font=('Arial',15,'bold'),fg='blue',bg='#00FF00',
                        activebackground="#00FF00",
                        activeforeground="blue",
                        relief=RAISED,bd=10, command=lambda: mainitFrame(1, notebook, btn_zesti, btn_instrumenti))
pogaInstrumenti.place(relx=0.1,rely=0.01,relwidth=0.08,relheight=0.06)

# simboli
pogaPlaukstas = Button(zesti,
              image=plaukstasPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zesti,plaukstasImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaPlaukstas.place(relx=0.01,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPlaukstasx2 = Button(zesti,
              image=plaukstasx2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zesti,plaukstasx2Img, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaPlaukstasx2.place(relx=0.1,rely=0.85,relwidth=0.072, relheight=0.128)

pogaKajas = Button(zesti,
              image=kajasPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zesti,kajasImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaKajas.place(relx=0.19,rely=0.85,relwidth=0.072, relheight=0.128)

pogaKajasx2 = Button(zesti,
              image=kajasPogax2Img,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zesti,kajasx2Img, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaKajasx2.place(relx=0.28,rely=0.85,relwidth=0.072, relheight=0.128)

pogaKnipis = Button(zesti,
              image=knipisPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zesti,knipisImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaKnipis.place(relx=0.37,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPlaukstasKajas = Button(zesti,
              image=plaukstasKajasPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zesti,plaukstasKajasImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaPlaukstasKajas.place(relx=0.46,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPlaukstasKajasx2 = Button(zesti,
              image=plaukstasKajasx2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zesti,plaukstasKajasx2Img, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaPlaukstasKajasx2.place(relx=0.55,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPauze = Button(zesti,
              image=pauzePogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(zesti,pauzeImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaPauze.place(relx=0.64,rely=0.85,relwidth=0.072, relheight=0.128)

# iestatijumi
pogaEnter = Button(zesti,
                   image=enterPogaImg,bg="#222222",activebackground="#222222",bd=0,
                   command=lambda: Enter(zesti, zesti, pogaEnter, pogaEnter2))
pogaEnter.place(relx=0.65,rely=0.01,relwidth=0.072, relheight=0.128)
pogaEnter["state"] = "disabled"

pogaNodzest = Button(zesti,
                   image=BackspacePogaImg,bg="#222222",activebackground="#222222",bd=0,
                   command=lambda: Nodzest(zesti, zesti))
pogaNodzest.place(relx=0.73,rely=0.01)
pogaNodzest["state"] = "disabled"

pogaBildesReset = Button(zesti,
              image=resetBildesPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: ResetBildes(zesti, zesti, virsraksts, pogaEnter, pogaEnter2, virsraksts2))
pogaBildesReset.place(relx=0.83,rely=0.85,relwidth=0.072, relheight=0.128)

pogaReset = Button(zesti,
              image=resetPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: Reset(zesti, zesti, virsraksts, virsraksts2, pogaEnter, pogaEnter2))
pogaReset.place(relx=0.92,rely=0.85,relwidth=0.072, relheight=0.128)


# INSTRUMENTI SADAĻA (2. TABS)
virsraksts2 = Label(instrumenti,
                   text="Ritma Koks",
                   font=('Arial',30,'bold'),
                   fg='blue',
                   bg='#00FF00',
                   relief=RAISED,
                   bd=20,)
virsraksts2.pack()

# BILDES
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

# POGAS
btn_zesti = Button(instrumenti, text="Žesti",
                        font=('Arial',15,'bold'),fg='blue',bg='#00FF00',
                        activebackground="#00FF00",
                        activeforeground="blue",
                        relief=RAISED,bd=10, command=lambda: mainitFrame(0, notebook, btn_zesti, btn_instrumenti))
btn_zesti.place(relx=0.01,rely=0.01,relwidth=0.08,relheight=0.06)

btn_instrumenti = Button(instrumenti, text="Instrumenti",
                        font=('Arial',15,'bold'),fg='blue',bg='#00FF00',
                        activebackground="#00FF00",
                        activeforeground="blue",
                        relief=SUNKEN,bd=10, command=lambda: mainitFrame(1, notebook, btn_zesti, btn_instrumenti))
btn_instrumenti.place(relx=0.1,rely=0.01,relwidth=0.08,relheight=0.06)

# simboli
pogaPlaukstas2 = Button(instrumenti,
              image=plaukstas2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(instrumenti,plaukstas2Img, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaPlaukstas2.place(relx=0.01,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPlaukstasx22 = Button(instrumenti,
              image=plaukstasx22PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(instrumenti,plaukstasx22Img, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaPlaukstasx22.place(relx=0.1,rely=0.85,relwidth=0.072, relheight=0.128)

pogaTrijsturis = Button(instrumenti,
              image=trijsturisPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(instrumenti,trijsturisImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaTrijsturis.place(relx=0.19,rely=0.85,relwidth=0.072, relheight=0.128)

pogaKocini = Button(instrumenti,
              image=kociniPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(instrumenti,kociniImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaKocini.place(relx=0.28,rely=0.85,relwidth=0.072, relheight=0.128)

pogaMarakass = Button(instrumenti,
              image=marakassPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(instrumenti,marakassImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaMarakass.place(relx=0.37,rely=0.85,relwidth=0.072, relheight=0.128)

pogaBungas = Button(instrumenti,
              image=bungasPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(instrumenti,bungasImg, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaBungas.place(relx=0.46,rely=0.85,relwidth=0.072, relheight=0.128)

pogaPauze2 = Button(instrumenti,
              image=pauze2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: PievienoBildi(instrumenti,pauze2Img, zesti, pauzeImg, pauze2Img, pogaEnter, pogaEnter2, pogaNodzest))
pogaPauze2.place(relx=0.55,rely=0.85,relwidth=0.072, relheight=0.128)

# iestatijumi
pogaEnter2 = Button(instrumenti,
                   image=enterPogaImg,bg="#222222",activebackground="#222222",bd=0,
                   command=lambda: Enter(instrumenti, zesti, pogaEnter, pogaEnter2))
pogaEnter2.place(relx=0.65,rely=0.01,relwidth=0.072, relheight=0.128)
pogaEnter2["state"] = "disabled"

pogaBildesReset2 = Button(instrumenti,
              image=resetBildes2PogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: ResetBildes(instrumenti, zesti, virsraksts, pogaEnter, pogaEnter2, virsraksts2))
pogaBildesReset2.place(relx=0.83,rely=0.85,relwidth=0.072, relheight=0.128)

pogaReset2 = Button(instrumenti,
              image=resetPogaImg,bg="#222222",activebackground="#222222",relief=RAISED,bd=10,
              command=lambda: Reset(instrumenti, zesti, virsraksts, virsraksts2, pogaEnter, pogaEnter2))
pogaReset2.place(relx=0.92,rely=0.85,relwidth=0.072, relheight=0.128)

galvenais.mainloop()