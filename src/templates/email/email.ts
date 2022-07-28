export const createEmailContent = (studentData: string[]): string => `<div>
    <h1>Witamy w naszym systemie!</h1>
    <p>Twój email: <strong>${studentData[1]}</strong> został dodany w naszej bazie jako email uczestnika kursu poszukującego pracy.</p>
    <p>Cieszymy się, że zdecydowałeś się na ten krok, przecież po to rok temu zaczynaliśmy podróż o nazwie MegaK!</p>
    <h4>Jeśli chcesz zapisać się do naszego systemu, potwierdź rejestrację.</h4>
    <a href='${studentData[0]}'>
        <button>Potwierdź rejestrację!</button>
    </a>
    </br>
    </br>
    <em>Jeśli dostałeś tego maila przypadkiem lub nie chcesz zapisywać się do naszego systemu zingoruj tę wiadomość.</em>
    </div>`;
