"""Seed the lesson catalog with SIBI content on first boot."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Lesson, Sign

ALPHABET_SIGNS: list[tuple[str, str, str]] = [
    ("A", "Kepalkan tangan dengan ibu jari di samping jari telunjuk.", "Tunjukkan kepalan menghadap ke depan."),
    ("B", "Telapak tangan terbuka menghadap ke depan, ibu jari menempel ke telapak.", "Empat jari rapat, ibu jari ditekuk ke dalam."),
    ("C", "Lengkungkan jari membentuk huruf C.", "Telapak tangan menghadap ke samping."),
    ("D", "Telunjuk lurus ke atas, jari lain menyentuh ibu jari membentuk lingkaran.", "Mirip seperti menunjuk ke atas."),
    ("E", "Tekuk semua jari menyentuh ibu jari.", "Telapak menghadap ke depan."),
    ("F", "Telunjuk dan ibu jari membentuk lingkaran, tiga jari lain lurus.", "Tanda OK menghadap ke depan."),
    ("G", "Telunjuk dan ibu jari sejajar menunjuk ke samping.", "Jari lain dikepalkan."),
    ("H", "Telunjuk dan jari tengah sejajar menunjuk ke samping.", "Jari lain dikepalkan."),
    ("I", "Kelingking diangkat ke atas, jari lain dikepalkan.", "Punggung tangan menghadap ke depan."),
    ("J", "Mulai dari posisi I lalu gerakkan kelingking membentuk huruf J.", "Gerakan dinamis - latih perlahan."),
    ("K", "Telunjuk lurus ke atas, jari tengah miring, ibu jari di antara keduanya.", "Mirip simbol perdamaian terbuka."),
    ("L", "Telunjuk ke atas, ibu jari ke samping membentuk huruf L.", "Jari lain dikepalkan."),
    ("M", "Tiga jari (telunjuk, tengah, manis) menutupi ibu jari.", "Punggung tangan menghadap ke depan."),
    ("N", "Telunjuk dan jari tengah menutupi ibu jari.", "Punggung tangan menghadap ke depan."),
    ("O", "Semua jari bertemu ibu jari membentuk lingkaran O.", "Telapak menghadap ke depan."),
    ("P", "Mirip K tetapi diarahkan ke bawah.", "Telunjuk dan jari tengah menunjuk ke bawah."),
    ("Q", "Mirip G tetapi diarahkan ke bawah.", "Telunjuk dan ibu jari menunjuk ke bawah."),
    ("R", "Silangkan telunjuk dan jari tengah.", "Jari lain dikepalkan."),
    ("S", "Kepalkan tangan dengan ibu jari di depan jari-jari.", "Buku-buku jari menghadap ke depan."),
    ("T", "Ibu jari diapit antara telunjuk dan jari tengah.", "Jari lain dikepalkan."),
    ("U", "Telunjuk dan jari tengah rapat menunjuk ke atas.", "Jari lain dikepalkan."),
    ("V", "Telunjuk dan jari tengah membentuk huruf V.", "Tanda damai klasik."),
    ("W", "Telunjuk, jari tengah, dan jari manis lurus ke atas.", "Ibu jari menekan kelingking."),
    ("X", "Tekuk telunjuk membentuk kail.", "Jari lain dikepalkan."),
    ("Y", "Ibu jari dan kelingking terentang, jari lain dikepalkan.", "Tanda 'hang loose'."),
    ("Z", "Gambarkan huruf Z di udara dengan telunjuk.", "Gerakan dinamis - jaga ritme."),
]


NUMBER_SIGNS: list[tuple[str, str, str]] = [
    ("0", "Bentuk lingkaran dengan semua jari menyentuh ibu jari.", "Mirip huruf O dalam alfabet SIBI."),
    ("1", "Telunjuk lurus ke atas.", "Jari lain dikepalkan."),
    ("2", "Telunjuk dan jari tengah membentuk huruf V.", "Jari lain dikepalkan."),
    ("3", "Telunjuk, jari tengah, dan jari manis lurus.", "Ibu jari menekan kelingking."),
    ("4", "Empat jari lurus, ibu jari menempel ke telapak.", "Telapak menghadap ke depan."),
    ("5", "Semua jari terentang, telapak menghadap ke depan.", "Posisi 'high five'."),
    ("6", "Ibu jari menyentuh kelingking, tiga jari lain lurus.", "Mirip huruf W."),
    ("7", "Ibu jari menyentuh jari manis, tiga jari lain lurus.", "Telapak menghadap ke depan."),
    ("8", "Ibu jari menyentuh jari tengah, tiga jari lain lurus.", "Bentuk seperti pistol terbalik."),
    ("9", "Ibu jari menyentuh telunjuk membentuk lingkaran, tiga jari lain lurus.", "Mirip huruf F."),
]


GREETING_SIGNS: list[tuple[str, str, str]] = [
    ("Halo", "Telapak terbuka melambai dari sisi kepala.", "Gerakan dinamis - 30 frame."),
    ("Terima kasih", "Letakkan tangan di dagu lalu turunkan ke depan.", "Senyumkan ekspresi wajah."),
    ("Maaf", "Kepalkan tangan dan putar di depan dada.", "Gerakan lembut."),
    ("Selamat pagi", "Letakkan satu telapak di bawah siku, lalu telapak lain bergerak ke atas seperti matahari terbit.", "Gerakan dinamis."),
    ("Sampai jumpa", "Lambaikan telapak terbuka ke arah depan.", "Gerakan dinamis - akhiri dengan tersenyum."),
]


def _public_image_url(label: str, kind: str) -> str:
    """Return a deterministic remote URL for the reference illustration.

    We use a free icon CDN so the demo works without bundling any binary assets.
    """
    safe = label.lower().replace(" ", "-")
    return f"https://placehold.co/256x256/0f172a/f8fafc?text=SIBI%20{kind}%3A%20{safe}"


def seed_lessons(db: Session) -> None:
    if db.query(Lesson).first() is not None:
        return

    alphabet = Lesson(
        slug="alphabet",
        title="Alfabet SIBI (A–Z)",
        description="Pelajari isyarat statis untuk 26 huruf alfabet SIBI.",
        category="alphabet",
        order_index=1,
        is_dynamic=False,
    )
    numbers = Lesson(
        slug="numbers",
        title="Angka 0–9",
        description="Pelajari isyarat tangan untuk angka 0 sampai 9.",
        category="numbers",
        order_index=2,
        is_dynamic=False,
    )
    greetings = Lesson(
        slug="greetings",
        title="Sapaan & Ungkapan Umum",
        description="Pelajari isyarat dinamis untuk sapaan sehari-hari.",
        category="greetings",
        order_index=3,
        is_dynamic=True,
    )

    for idx, (label, description, instructions) in enumerate(ALPHABET_SIGNS):
        alphabet.signs.append(
            Sign(
                label=label,
                description=description,
                instructions=instructions,
                image_alt=f"Ilustrasi isyarat huruf {label} dalam SIBI.",
                image_url=_public_image_url(label, "Huruf"),
                order_index=idx,
            )
        )

    for idx, (label, description, instructions) in enumerate(NUMBER_SIGNS):
        numbers.signs.append(
            Sign(
                label=label,
                description=description,
                instructions=instructions,
                image_alt=f"Ilustrasi isyarat angka {label} dalam SIBI.",
                image_url=_public_image_url(label, "Angka"),
                order_index=idx,
            )
        )

    for idx, (label, description, instructions) in enumerate(GREETING_SIGNS):
        greetings.signs.append(
            Sign(
                label=label,
                description=description,
                instructions=instructions,
                image_alt=f"Ilustrasi isyarat dinamis '{label}' dalam SIBI.",
                image_url=_public_image_url(label, "Sapaan"),
                order_index=idx,
            )
        )

    db.add_all([alphabet, numbers, greetings])
    db.commit()
