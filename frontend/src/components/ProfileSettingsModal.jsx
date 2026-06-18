import Icon from './Icon'

function ProfileSettingsModal({
  accountRole,
  adminProfileForm,
  mode,
  passwordForm,
  passwordStatus,
  profileForm,
  profileStatus,
  t,
  onChangePassword,
  onChangeAdminProfile,
  onChangeProfile,
  onClose,
  onSubmitPassword,
  onSubmitProfile,
}) {
  if (!mode) return null

  const isPassword = mode === 'password'
  const isAdmin = accountRole === 'admin'
  const isDriver = accountRole === 'driver'
  const status = isPassword ? passwordStatus : profileStatus

  return (
    <div className="profile-modal-backdrop" role="presentation">
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
        <div className="profile-modal-header">
          <div>
            <p>{isPassword ? t.profile.editPassword : t.profile.editProfile}</p>
            <h2 id="profile-modal-title">{isPassword ? t.profile.passwordTitle : t.profile.profileTitle}</h2>
          </div>
          <button type="button" className="profile-modal-close" aria-label={t.profile.close} onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        {isPassword ? (
          <form className="register-form profile-modal-form" onSubmit={onSubmitPassword}>
            <label>
              <span>{t.profile.currentPassword}</span>
              <input
                name="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={onChangePassword}
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              <span>{t.profile.newPassword}</span>
              <input
                name="password"
                type="password"
                value={passwordForm.password}
                onChange={onChangePassword}
                autoComplete="new-password"
                minLength="6"
                required
              />
            </label>
            <label>
              <span>{t.profile.confirmPassword}</span>
              <input
                name="password_confirmation"
                type="password"
                value={passwordForm.password_confirmation}
                onChange={onChangePassword}
                autoComplete="new-password"
                minLength="6"
                required
              />
            </label>
            <ProfileModalFooter status={status} t={t} />
          </form>
        ) : isAdmin ? (
          <form className="register-form profile-modal-form" onSubmit={onSubmitProfile}>
            <label>
              <span>{t.registerForm.firstName}</span>
              <input
                name="name"
                type="text"
                value={adminProfileForm.name}
                onChange={onChangeAdminProfile}
                required
              />
            </label>
            <label>
              <span>{t.registerForm.email}</span>
              <input
                name="email"
                type="email"
                value={adminProfileForm.email}
                onChange={onChangeAdminProfile}
                required
              />
            </label>
            <ProfileModalFooter status={status} t={t} />
          </form>
        ) : (
          <form className="register-form profile-modal-form" onSubmit={onSubmitProfile}>
            <div className="form-grid">
              <label>
                <span>{t.registerForm.firstName}</span>
                <input
                  name="first_name"
                  type="text"
                  value={profileForm.first_name}
                  onChange={onChangeProfile}
                  autoComplete="given-name"
                  required
                />
              </label>
              <label>
                <span>{t.registerForm.lastName}</span>
                <input
                  name="last_name"
                  type="text"
                  value={profileForm.last_name}
                  onChange={onChangeProfile}
                  autoComplete="family-name"
                  required
                />
              </label>
              <label>
                <span>{t.registerForm.phone}</span>
                <input
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={onChangeProfile}
                  autoComplete="tel"
                  required
                />
              </label>
              <label>
                <span>{t.registerForm.email}</span>
                <input
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={onChangeProfile}
                  autoComplete="email"
                  required
                />
              </label>
            </div>
            {isDriver && (
              <div className="form-grid driver-fields">
                <label>
                  <span>{t.registerForm.vehicleNumber}</span>
                  <input
                    name="vehicle_number"
                    type="text"
                    value={profileForm.vehicle_number}
                    onChange={onChangeProfile}
                    required
                  />
                </label>
                <label>
                  <span>{t.registerForm.vehicleCategory}</span>
                  <select
                    name="vehicle_category"
                    value={profileForm.vehicle_category}
                    onChange={onChangeProfile}
                    required
                  >
                    <option value="A">{t.registerForm.categories.A}</option>
                    <option value="B">{t.registerForm.categories.B}</option>
                    <option value="C">{t.registerForm.categories.C}</option>
                  </select>
                </label>
              </div>
            )}
            <ProfileModalFooter status={status} t={t} />
          </form>
        )}
      </section>
    </div>
  )
}

function ProfileModalFooter({ status, t }) {
  return (
    <div className="form-footer">
      <button type="submit" disabled={status.type === 'saving'}>
        <Icon name="check" />
        <span>{status.type === 'saving' ? t.profile.saving : t.profile.save}</span>
      </button>

      {status.type !== 'idle' && status.type !== 'saving' && (
        <p className={`form-message ${status.type}`}>{status.message}</p>
      )}
    </div>
  )
}

export default ProfileSettingsModal
