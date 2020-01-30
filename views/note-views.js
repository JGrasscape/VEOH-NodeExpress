const notes_view = (data) => {
    let html = `
        <html>
        <body>
            Logged in as user: ${data.user.name}
            <form action="/add_note" method="POST">
                <input type="text" name="note">
                <button type="submit">Add note</button>
            </form>`;

        // Haetaan notesit kannasta
        data.notes.forEach((note) => {
            html = +note.text;            
            // Poistonappi
            html = +`
                <form action="delete_note" method="POST">
                    <input type="hidden" name="note_id" value="${note._id}">
                    <button type="submit">Delete note</button>
                </form>
            `;
        });

        html = +`
            <hr/>
            <form action="/logout" method="POST">
                <button type="submit">Log out</button>
            </form>
        </body>
        </html>
        `;

        return html;
};

module.exports.notes_view = notes_view;