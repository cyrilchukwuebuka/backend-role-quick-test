import { Gender } from 'src/user/entities/user.entity';

export const user1 = users[0]
export const user2 = users[1]

export const users = [
  {
    // id: 'aa167675-f394-46e0-8864-f8b0546fd5ea',
    id: '1',
    firstname: 'Ebuka',
    lastname: 'Doe',
    username: 'ebukadoe3',
    gender: Gender.MALE,
    balance: {
      // id: '78a7033a-8282-4d18-be92-d66ea64efb84',
      id: '1',
      created_at: '2024-10-22T01:23:23.762Z',
      updated_at: '2024-10-22T01:36:23.250Z',
      amount: '200.00',
    },
  },
  {
    // id: 'b2380b17-9cd7-4e3a-ab59-cae8050cd1b7',
    id: '2',
    firstname: 'Ebuka',
    lastname: 'Doe',
    username: 'ebukadoe4',
    gender: Gender.MALE,
    balance: {
      // id: '78a7033a-8282-4d18-be92-d66ea64efb84',
      id: '2',
      created_at: '2024-10-22T01:23:23.762Z',
      updated_at: '2024-10-22T01:36:23.250Z',
      amount: '400.00',
    },
  },
];
