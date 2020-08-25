const users = {
  1: {
    name: 'X Æ A-12',
    country: 'Russia',
    birthdate: '1998-08-12',
    skills: ['Beauty', 'Auto'],
    photo: 'http://unsplash.it/500/800',
    bio:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, natus tempora! Sunt impedit maxime.',
  },
  2: {
    name: 'Peter Smith',
    country: 'USA',
    birthdate: '1990-11-12',
    skills: ['IT', 'Sport', 'Art'],
    photo: 'http://unsplash.it/500/800',
    bio: 'Numquam, natus tempora! Sunt impedit maxime.',
  },
};

export function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      users[id] ? resolve(users[id]) : reject('user not found');
    }, 500);
  });
}
