import React from 'react';
import './admin.css';

const AdminLayout = ({ pretitle, title, subtitle, actions, children }) => {
    return (
        <main className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <div>
                        {pretitle ? <div className="admin-pretitle">{pretitle}</div> : null}
                        <h1 className="admin-title">{title}</h1>
                        {subtitle ? <div className="admin-subtitle">{subtitle}</div> : null}
                    </div>
                    {actions ? <div className="admin-actions">{actions}</div> : null}
                </header>

                <section className="admin-card">
                    {children}
                </section>
            </div>
        </main>
    );
};

export default AdminLayout;
