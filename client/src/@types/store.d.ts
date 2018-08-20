declare namespace Store {
  export interface IState {
    behavior: IBehaviorState;
    notations: INotationsState;
    session: ISessionState;
    tags: ITagsState;
    users: IUsersState;
    video: IVideoState;
    viewport: IViewportState;
  }

  export interface INotationsState {
    index: Notation.INotation[],
    show: Notation.INotation,
    edit: Notation.INotation
  }

  export interface ISessionState {
    signedIn: boolean;
    email: string;
    uid: string;
    id: number;
    image: string | null;
    name: string;
    provider: SessionProviders;
    role: Role.Roles;
  }

  export interface ITagsState {
    index: Tag.ITag[];
  }

  export interface IUsersState {
    edit: User.IBaseUser;
    index: User.IBaseUser[];
    show: User.IBaseUser;
  }

  export interface IVideoState {
    kind: Video.Kinds | null;
    src: string;
    player: Youtube.IPlayer | null;
    playerState?: Youtube.IPlayerStates;
    isActive?: boolean;
  }

  export interface IViewportState {
    type: ViewportTypes;
    width: number;
  }

  export interface IBehaviorState {
    showLoop: boolean;
  }

  export interface IUiState {
    isNotationMenuVisible: boolean;
  }
}
