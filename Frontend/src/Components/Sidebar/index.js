import React, { useEffect } from 'react';
import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarContent,
} from 'react-pro-sidebar';
import { FaTachometerAlt, FaGem, FaList, FaBookOpen } from 'react-icons/fa';
import { MdDashboard, MdForum } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { CgFileDocument } from 'react-icons/cg';
import iconCPSImg from '../../Assets/Images/ICON CPS white.svg';

const Aside = ({
  collapsed,
  rtl,
  toggled,
  handleToggleSidebar,
  handleCollapsedChange,
  isPrep,
  isRegistered,
  history,
  setToggled,
}) => {
  const highlightedStyle = { background: 'rgba(38, 38, 38, 0.1)' };
  const pathName = history.location.pathname;

  const getHighlightedStyle = routes => {
    return routes.includes(pathName) ? highlightedStyle : {};
  };

  useEffect(() => {
    if (window.innerWidth < 769) {
      handleCollapsedChange(false);
    }
  }, [toggled]);

  return (
    <ProSidebar
      collapsed={collapsed}
      toggled={toggled}
      breakPoint='md'
      onToggle={handleToggleSidebar}
    >
      <SidebarHeader>
        <div
          style={{
            padding: '24px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {!collapsed && (
            <Link style={{ fontSize: 'initial' }} to='/' className='sidebarHeader'>
              {/* <span style = {{fontSize: '26px', fontWeight: 400}}>ICON</span><span style = {{fontSize: '26px', fontWeight: '900'}}>CPS</span> */}
              <img src={iconCPSImg} style={{ width: '65%' }} />
            </Link>
          )}
          <FaList
            onClick={() => {
              if (window.innerWidth > 769) {
                handleCollapsedChange(!collapsed);
              } else {
                setToggled(false);
              }
            }}
            style={{ cursor: 'pointer', height: 'auto', fontSize: 35 }}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {(!isPrep || !isRegistered) && (
          <Menu iconShape='circle'>
            <MenuItem
              icon={<MdDashboard />}
              style={getHighlightedStyle(['/dashboard'])}
            >
              {<span>Dashboard</span>}
              <Link to='/dashboard' />
            </MenuItem>
            <MenuItem
              icon={<FaGem />}
              style={getHighlightedStyle(['/proposals', '/newProposal'])}
            >
              {' '}
              {<span>Proposals</span>}
              <Link to={process.env.PUBLIC_URL + '/proposals'} />
            </MenuItem>
            <MenuItem
              icon={<FaList />}
              style={getHighlightedStyle([
                '/progress-reports',
                '/newProgressReport',
              ])}
            >
              {' '}
              {<span>Progress Reports</span>}
              <Link to='/progress-reports' />
            </MenuItem>

            <MenuItem icon={<MdForum />}>
              {' '}
              {<span>ICON Forum</span>}
              <a
                href='https://forum.icon.community/c/contribution-proposals/45'
                target='_blank'
              />
            </MenuItem>

            <MenuItem icon={<FaBookOpen />}>
              {' '}
              {<span>User Guide</span>}
              <a
                href='https://medium.com/ibriz-iconosphere/how-to-use-the-contribution-proposal-system-1efe714c9182'
                target='_blank'
              />
            </MenuItem>

            {/* <MenuItem icon={<CgFileDocument/>}
              > {<span>CPS Whitepaper</span>}
                <a href="https://docs.google.com/document/d/1yPwgsXx4ow5NVnG1ktMKYp5JvjQvWEfuSkq6Iy-OIXA/" target = "_blank" />

              </MenuItem>  */}
          </Menu>
        )}

        {isPrep && isRegistered && (
          <>
            <Menu iconShape='circle'>
              <MenuItem
                icon={<MdDashboard />}
                style={getHighlightedStyle(['/dashboard'])}
              >
                {<span>Dashboard</span>}
                <Link to='/dashboard' />
              </MenuItem>
              <MenuItem
                icon={<FaGem />}
                style={getHighlightedStyle(['/proposals', '/newProposal'])}
              >
                {' '}
                {<span>Proposals</span>}
                <Link to={process.env.PUBLIC_URL + '/proposals'} />
              </MenuItem>
              <MenuItem
                icon={<FaList />}
                style={getHighlightedStyle([
                  '/progress-reports',
                  '/newProgressReport',
                ])}
              >
                {' '}
                {<span>Progress Reports</span>}
                <Link to='/progress-reports' />
              </MenuItem>

              {/* <MenuItem
                icon={<FaTachometerAlt />}

              >
                {<span>Sponsor Requests</span>}
                <Link to="/sponsorRequests" />

              </MenuItem> */}
              {/* <MenuItem icon={<FaGem />}
                suffix={<Badge size="xl" variant="primary" >3</Badge>}> {<span>Voting</span>}
                <Link to="/voting" />

              </MenuItem> */}
              {/* <MenuItem icon={<FaList />}
              > {<span>Backed Projects</span>}
                <Link to="/backed-projects" />

              </MenuItem> */}

              <MenuItem icon={<MdForum />}>
                {' '}
                {<span>ICON Forum</span>}
                <a
                  href='https://forum.icon.community/c/contribution-proposals/45'
                  target='_blank'
                />
              </MenuItem>

              <MenuItem icon={<FaBookOpen />}>
                {' '}
                {<span>User Guide</span>}
                <a
                  href='https://medium.com/ibriz-iconosphere/how-to-use-the-contribution-proposal-system-1efe714c9182'
                  target='_blank'
                />
              </MenuItem>

              {/* <MenuItem icon={<CgFileDocument/>}
              > {<span>CPS Whitepaper</span>}
                <a href="https://docs.google.com/document/d/1yPwgsXx4ow5NVnG1ktMKYp5JvjQvWEfuSkq6Iy-OIXA/" target = "_blank" />

              </MenuItem>  */}
            </Menu>
          </>
        )}
        {/* <Menu iconShape="circle">
          <SubMenu
            suffix={<span className="badge yellow">3</span>}
            title={Message.withSuffix}
            icon={<FaRegLaughWink />}
          >
            <MenuItem>{Message.submenu} 1</MenuItem>
            <MenuItem>{Message.submenu} 2</MenuItem>
            <MenuItem>{Message.submenu} 3</MenuItem>
          </SubMenu>
          <SubMenu
            prefix={<span className="badge gray">3</span>}
            title={Message.withPrefix}
            icon={<FaHeart />}
          >
            <MenuItem>{Message.submenu} 1</MenuItem>
            <MenuItem>{Message.submenu} 2</MenuItem>
            <MenuItem>{Message.submenu} 3</MenuItem>
          </SubMenu>
          <SubMenu title={Message.multiLevel} icon={<FaList />}>
            <MenuItem>{Message.submenu} 1 </MenuItem>
            <MenuItem>{Message.submenu} 2 </MenuItem>
            <SubMenu title={`${Message.submenu} 3`}>
              <MenuItem>{Message.submenu} 3.1 </MenuItem>
              <MenuItem>{Message.submenu} 3.2 </MenuItem>
              <SubMenu title={`${Message.submenu} 3.3`}>
                <MenuItem>{Message.submenu} 3.3.1 </MenuItem>
                <MenuItem>{Message.submenu} 3.3.2 </MenuItem>
                <MenuItem>{Message.submenu} 3.3.3 </MenuItem>
              </SubMenu>
            </SubMenu>
          </SubMenu>
        </Menu> */}
      </SidebarContent>
    </ProSidebar>
  );
};

const mapStateToProps = state => ({
  isPrep: state.account.isPrep,
  isRegistered: state.account.isRegistered,
});

export default withRouter(connect(mapStateToProps)(Aside));
