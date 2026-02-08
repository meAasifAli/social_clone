import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  BeforeInsert,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { RefreshToken } from './refresh-token.entity';
import { Follow } from './follow.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /* ---------- Identity ---------- */
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ default: 'local' })
  provider: string;

  @Column({ default: 'user' })
  role: string;

  /* ---------- Account Status ---------- */
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  /* ---------- Email Verification ---------- */
  @Column({ type: 'varchar', nullable: true, select: false })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires: Date | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  /* ---------- Email Verification OTP ---------- */
  @Column({ nullable: true, select: false })
  emailOtp: string;

  @Column({ type: 'timestamp', nullable: true })
  emailOtpExpires: Date;

  /* ---------- Relations ---------- */
  @OneToOne(() => UserProfile, (p) => p.user, { cascade: true })
  profile: UserProfile;

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Follow, (f) => f.follower)
  following: Follow[];

  @OneToMany(() => Follow, (f) => f.following)
  followers: Follow[];

  /* ---------- Audit ---------- */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  /* ---------- Hooks ---------- */
  @BeforeInsert()
  generateUsername() {
    if (!this.username && this.email) {
      this.username =
        this.email.split('@')[0] + Math.floor(Math.random() * 10000);
    }
  }
}
