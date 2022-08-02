import { UrlAndEmailToSend } from '../../../types';

export const createInvitationEmailHTML = (
  userData: UrlAndEmailToSend,
): string => `<div>
    <h1>Witamy w naszym systemie!</h1>
    <p>Twój email: <strong>${userData.email}</strong> został dodany w naszej bazie jako email użytkownika naszego systemu.</p>
    <p>Cieszymy się, że podejmujesz ten krok, przecież po to rok temu zaczynaliśmy podróż o nazwie MegaK!</p>
    <h4>Jeśli chcesz zapisać się do naszego systemu, potwierdź rejestrację.</h4>
    <a href='${userData.url}'>
        <button>Potwierdź rejestrację!</button>
    </a>
    </br>
    </br>
    </hr>
    <em>Jeśli dostałeś tego maila przypadkiem lub nie chcesz zapisywać się do naszego systemu zingoruj tę wiadomość. Nie będziemy Cię więcej niepokoić.</em>
    </div>`;

export const createForgotPasswordEmailHTML = (
  userData: UrlAndEmailToSend,
): string => `<div>
    <h1>Zapomniałeś/aś hasła dla konta ${userData.email}?</h1>
    <p>Nic nie szkodzi, poniżej znajdziesz link, do jego odzyskiwania.</p>
    <p>Kliknij w niego, by ponownie cieszyć się systemem MegaK!</p>
    <h4>Kliknij w link i odzyskaj hasło.</h4>
    <a href='${userData.url}'>
        <button>Odzyskaj Hasło!</button>
    </a>
    </br>
    </br>
    </hr>
    <em>Jeśli dostałeś tego maila przypadkiem lub masz najmniejszej ochoty odzyskiwać hasła do naszego systemu zingoruj tę wiadomość. Nie będziemy Cię więcej niepokoić.</em>
    </div>`;
